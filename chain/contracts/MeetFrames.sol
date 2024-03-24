// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MeetFrames is Ownable {
    uint256 private _frameId = 0;

    mapping(string => FrameConfig) private _frames; // mapping frame_id => frame_config
    mapping(string => mapping(uint256 => FrameBid)) private _frameBids; // mapping frame_id => bidder_fid => frame_bid

    // New mapping for mentor to their array of active frame configs. Assuming a max of 4 active configs.
    mapping(uint256 => string[4]) private _mentorActiveConfigs;
    // TODO: Add old frames to mentor mapping

    struct FrameBid {
        address bidder;
        uint256 bidderFid;
        uint256 bid;
        uint256 valueLocked;
    }

    struct FrameConfig {
        address mentor;
        string mentorName; // ideally - not on-chain
        string mentorProfile; // ideally - not on-chain
        string sessionTitle; // ideally - not on-chain
        uint256 fid;
        uint64 closingTime;
        uint64 targetTime;
        uint256 minBid;
        uint256 fee; // service contract fee
        uint256 winner; // winner fid
        uint256 winnerBid;
        bool completed;
        bool activated;
    }

    constructor() Ownable(msg.sender) {}

    function createFrame(
        string memory newFrameId,
        address mentor,
        string memory mentorName,
        string memory mentorProfile,
        string memory sessionTitle,
        uint256 fid,
        uint64 closingTime,
        uint64 targetTime,
        uint256 minBid
    ) external {
        require(
            msg.sender == mentor,
            "MeetFrames: only mentor can create frame"
        );

        require(
            _frames[newFrameId].activated == false,
            "MeetFrames: frame already exists"
        );

        _frames[newFrameId] = FrameConfig(
            mentor,
            mentorName,
            mentorProfile,
            sessionTitle,
            fid,
            closingTime,
            targetTime,
            minBid,
            minBid / 10, // 10% min Bid fee
            0,
            minBid,
            false,
            true // activated
        );
        _frameId += 1;
        _addActiveFrame(fid, newFrameId);
    }

    function bidFrame(uint256 bidderFid, string memory frameId) external payable {
        FrameConfig storage frame = _frames[frameId];
        require(
            msg.sender != frame.mentor && frame.fid != bidderFid,
            "MeetFrames: mentor cannot bid on his own frame"
        );
        require(frame.activated == true, "MeetFrames: frame is not activated");
        require(
            frame.closingTime > block.timestamp,
            "MeetFrames: frame is closed"
        );
        require(
            frame.targetTime > block.timestamp,
            "MeetFrames: frame is expired"
        );
        require(
            msg.value > frame.winnerBid,
            "MeetFrames: bid is lower than winner bid"
        );

        FrameBid storage frameBid = _frameBids[frameId][bidderFid];
        frameBid.bidder = msg.sender;
        frameBid.bidderFid = bidderFid;
        frameBid.bid = msg.value;
        frameBid.valueLocked = msg.value;

        // transfer back the previous winner's bid
        if (frame.winner != 0) {
            FrameBid storage previousBid = _frameBids[frameId][frame.winner];
            if (previousBid.valueLocked > 0) {
                (bool success, ) = previousBid.bidder.call{
                    value: previousBid.valueLocked
                }("");
                // TODO: handle failure better
                require(success, "MeetFrames: transfer failed");
                previousBid.valueLocked = 0;
            }
        }

        frame.winner = bidderFid;
        frame.winnerBid = msg.value;
    }

    function completeFrame(string memory frameId) external {
        FrameConfig storage frame = _frames[frameId];
        require(
            msg.sender == frame.mentor,
            "MeetFrames: only mentor can complete frame"
        );
        // TODO: consider closing time

        frame.completed = true;

        // has participants
        if (frame.winner != 0) {
            //transfer funds to mentor and leave fee
            (bool success, ) = frame.mentor.call{
                value: frame.winnerBid - frame.fee
            }("");
            require(success, "MeetFrames: transfer failed");
            _removeActiveFrame(frame.fid, frameId);
        }
    }

    function completeFrameOwner(string memory frameId) external onlyOwner {
        FrameConfig storage frame = _frames[frameId];

        require(frame.activated == true, "MeetFrames: frame is not activated");

        frame.completed = true;
        //debug reasons - transfer funds to owner
        (bool success, ) = owner().call{value: frame.winnerBid}("");
        require(success, "MeetFrames: transfer failed");
        _removeActiveFrame(frame.fid, frameId);
    }

    function getFrameConfig(
        string memory frameId
    ) external view returns (FrameConfig memory) {
        return _frames[frameId];
    }

    function getFrameBid(
        string memory frameId,
        uint256 bidderFid
    ) external view returns (FrameBid memory) {
        return _frameBids[frameId][bidderFid];
    }

    function getFrameWinner(
        string memory frameId
    ) external view returns (uint256) {
        return _frames[frameId].winner;
    }

    function getFrameWinnerBid(
        string memory frameId
    ) external view returns (uint256) {
        return _frames[frameId].winnerBid;
    }

    function getFrameCompleted(
        string memory frameId
    ) external view returns (bool) {
        return _frames[frameId].completed;
    }

    function getFrameValueLocked(
        string memory frameId,
        uint256 bidder
    ) external view returns (uint256) {
        return _frameBids[frameId][bidder].valueLocked;
    }

    function getActiveFrames(
        uint256 mentorFid
    ) external view returns (string[4] memory) {
        return _mentorActiveConfigs[mentorFid];
    }

    function getActiveFramesCount(
        uint256 mentorFid
    ) external view returns (uint256) {
        return _countActiveFrames(mentorFid);
    }

    // TODO: add internal concatenation
    function getCurrentFrameId() external view returns (uint256) {
        return _frameId;
    }

    function _countActiveFrames(
        uint256 mentorFid
    ) internal view returns (uint256) {
        // count not empty strings
        uint256 count = 0;
        for (uint256 i = 0; i < _mentorActiveConfigs[mentorFid].length; i++) {
            if (
                keccak256(bytes(_mentorActiveConfigs[mentorFid][i])) !=
                keccak256(bytes(""))
            ) {
                count++;
            }
        }
        return count;
    }

    function _addActiveFrame(uint256 mentorFid, string memory frameId) internal {
        require(
            _countActiveFrames(mentorFid) < 4,
            "MeetFrames: maximum of 4 active configs allowed"
        );
        bool assigned = false;
        // Check for duplicate frameId
        for (uint256 i = 0; i < _mentorActiveConfigs[mentorFid].length; i++) {
            require(
                keccak256(bytes(_mentorActiveConfigs[mentorFid][i])) !=
                    keccak256(bytes(frameId)),
                "MeetFrames: duplicate frameId not allowed"
            );
            if (
                keccak256(bytes(_mentorActiveConfigs[mentorFid][i])) ==
                keccak256(bytes("")) &&
                !assigned
            ) {
                _mentorActiveConfigs[mentorFid][i] = frameId;
                assigned = true;
            }
        }
    }

    function _removeActiveFrame(
        uint256 mentorFid,
        string memory frameId
    ) internal {
        for (uint256 i = 0; i < _mentorActiveConfigs[mentorFid].length; i++) {
            if (
                keccak256(bytes(_mentorActiveConfigs[mentorFid][i])) ==
                keccak256(bytes(frameId))
            ) {
                _mentorActiveConfigs[mentorFid][i] = "";
                return;
            }
        }
        require(false, "MeetFrames: frameId not found");
    }
}

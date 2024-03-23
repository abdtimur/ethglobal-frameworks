// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MeetFrames is Ownable {
    uint256 private _frameId = 0;

    mapping(string => FrameConfig) private _frames; // mapping frame_id => frame_config
    mapping(string => mapping(address => FrameBid)) private _frameBids; // mapping frame_id => bidder_address => frame_bid

    // New mapping for mentor to their array of active frame configs. Assuming a max of 4 active configs.
    mapping(address => string[4]) private _mentorActiveConfigs;
    // TODO: Add old frames to mentor mapping

    struct FrameBid {
        address bidder;
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
        address winner;
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
            address(0),
            minBid,
            false,
            true // activated
        );
        _frameId += 1;
        _addActiveFrame(mentor, newFrameId);
    }

    function bidFrame(address mentor, string memory frameId) external payable {
        require(
            msg.sender != mentor,
            "MeetFrames: mentor cannot bid on his own frame"
        );

        FrameConfig storage frame = _frames[frameId];
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

        FrameBid storage frameBid = _frameBids[frameId][msg.sender];
        frameBid.bidder = msg.sender;
        frameBid.bid = msg.value;
        frameBid.valueLocked = msg.value;

        // transfer back the previous winner's bid
        if (frame.winner != address(0)) {
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

        frame.winner = msg.sender;
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

        // no participants
        if (frame.winner == address(0)) return;

        //transfer funds to mentor and leave fee
        (bool success, ) = frame.mentor.call{
            value: frame.winnerBid - frame.fee
        }("");
        require(success, "MeetFrames: transfer failed");
        _removeActiveFrame(frame.mentor, frameId);
    }

    function completeFrameOwner(string memory frameId) external onlyOwner {
        FrameConfig storage frame = _frames[frameId];

        require(frame.activated == true, "MeetFrames: frame is not activated");

        frame.completed = true;
        //debug reasons - transfer funds to owner
        (bool success, ) = owner().call{value: frame.winnerBid}("");
        require(success, "MeetFrames: transfer failed");
        _removeActiveFrame(frame.mentor, frameId);
    }

    function getFrameConfig(
        string memory frameId
    ) external view returns (FrameConfig memory) {
        return _frames[frameId];
    }

    function getFrameBid(
        string memory frameId,
        address bidder
    ) external view returns (FrameBid memory) {
        return _frameBids[frameId][bidder];
    }

    function getFrameWinner(
        string memory frameId
    ) external view returns (address) {
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
        address bidder
    ) external view returns (uint256) {
        return _frameBids[frameId][bidder].valueLocked;
    }

    function getActiveFrames(
        address mentor
    ) external view returns (string[4] memory) {
        return _mentorActiveConfigs[mentor];
    }

    function getActiveFramesCount(
        address mentor
    ) external view returns (uint256) {
        return _countActiveFrames(mentor);
    }

    // TODO: add internal concatenation
    function getCurrentFrameId() external view returns (uint256) {
        return _frameId;
    }

    function _countActiveFrames(
        address mentor
    ) internal view returns (uint256) {
        // count not empty strings
        uint256 count = 0;
        for (uint256 i = 0; i < _mentorActiveConfigs[mentor].length; i++) {
            if (
                keccak256(bytes(_mentorActiveConfigs[mentor][i])) !=
                keccak256(bytes(""))
            ) {
                count++;
            }
        }
        return count;
    }

    function _addActiveFrame(address mentor, string memory frameId) internal {
        require(
            _countActiveFrames(mentor) < 4,
            "MeetFrames: maximum of 4 active configs allowed"
        );
        bool assigned = false;
        // Check for duplicate frameId
        for (uint256 i = 0; i < _mentorActiveConfigs[mentor].length; i++) {
            require(
                keccak256(bytes(_mentorActiveConfigs[mentor][i])) !=
                    keccak256(bytes(frameId)),
                "MeetFrames: duplicate frameId not allowed"
            );
            if (
                keccak256(bytes(_mentorActiveConfigs[mentor][i])) ==
                keccak256(bytes("")) &&
                !assigned
            ) {
                _mentorActiveConfigs[mentor][i] = frameId;
                assigned = true;
            }
        }
    }

    function _removeActiveFrame(
        address mentor,
        string memory frameId
    ) internal {
        for (uint256 i = 0; i < _mentorActiveConfigs[mentor].length; i++) {
            if (
                keccak256(bytes(_mentorActiveConfigs[mentor][i])) ==
                keccak256(bytes(frameId))
            ) {
                _mentorActiveConfigs[mentor][i] = "";
                return;
            }
        }
        require(false, "MeetFrames: frameId not found");
    }
}

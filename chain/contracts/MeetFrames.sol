// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MeetFrames is Ownable {
    mapping(address => mapping(string => FrameConfig) frames)
        private _mentorFrames; // mapping mentor_address => mentor_frame_ids => frame_config
    mapping(string => mapping(address => FrameBid)) private _frameBids; // mapping frame_id => bidder_address => frame_bid

    struct FrameBid {
        address bidder;
        uint256 bid;
        uint256 valueLocked;
    }

    struct FrameConfig {
        address mentor;
        uint256 fid;
        uint64 closingTime;
        uint64 targetTime;
        uint256 minBid;
        uint256 fee; // service contract fee
        address winner;
        uint256 winnerBid;
        bool completed;
    }

    constructor() Ownable(msg.sender) {}

    function createFrame(
        string memory frameId,
        address mentor,
        uint256 fid,
        uint64 closingTime,
        uint64 targetTime,
        uint256 minBid
    ) external {
        require(
            msg.sender == mentor,
            "MeetFrames: only mentor can create frame"
        );

        _mentorFrames[mentor][frameId] = FrameConfig(
            mentor,
            fid,
            closingTime,
            targetTime,
            minBid,
            minBid / 10, // 10% min Bid fee
            address(0),
            minBid,
            false
        );
    }

    function bidFrame(address mentor, string memory frameId) external payable {
        require(
            msg.sender != mentor,
            "MeetFrames: mentor cannot bid on his own frame"
        );

        FrameConfig storage frame = _mentorFrames[mentor][frameId];
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
                previousBid.valueLocked = 0;
            }
        }

        frame.winner = msg.sender;
        frame.winnerBid = msg.value;
    }

    function completeFrame(string memory frameId) external {
        FrameConfig storage frame = _mentorFrames[msg.sender][frameId];
        require(
            msg.sender == frame.mentor,
            "MeetFrames: only mentor can complete frame"
        );
        require(
            frame.closingTime < block.timestamp,
            "MeetFrames: frame is not closed"
        );

        frame.completed = true;

        // no participants
        if (frame.winner == address(0)) return;

        //transfer funds to mentor and leave fee
        (bool success, ) = frame.mentor.call{
            value: frame.winnerBid - frame.fee
        }("");
        require(success, "MeetFrames: transfer failed");
    }

    function completeFrameOwner(
        address mentor,
        string memory frameId
    ) external onlyOwner {
        FrameConfig storage frame = _mentorFrames[mentor][frameId];

        frame.completed = true;
        //debug reasons - transfer funds to owner
        (bool success, ) = owner().call{value: frame.winnerBid}("");
        require(success, "MeetFrames: transfer failed");
    }

    function getFrameConfig(
        address mentor,
        string memory frameId
    ) external view returns (FrameConfig memory) {
        return _mentorFrames[mentor][frameId];
    }

    function getFrameBid(
        string memory frameId,
        address bidder
    ) external view returns (FrameBid memory) {
        return _frameBids[frameId][bidder];
    }

    function getFrameWinner(
        address mentor,
        string memory frameId
    ) external view returns (address) {
        return _mentorFrames[mentor][frameId].winner;
    }

    function getFrameWinnerBid(
        address mentor,
        string memory frameId
    ) external view returns (uint256) {
        return _mentorFrames[mentor][frameId].winnerBid;
    }

    function getFrameCompleted(
        address mentor,
        string memory frameId
    ) external view returns (bool) {
        return _mentorFrames[mentor][frameId].completed;
    }

    function getFrameValueLocked(
        string memory frameId,
        address bidder
    ) external view returns (uint256) {
        return _frameBids[frameId][bidder].valueLocked;
    }

    function withdrawBid(string memory frameId) external {
        FrameBid storage frameBid = _frameBids[frameId][msg.sender];
        require(
            frameBid.bidder == msg.sender,
            "MeetFrames: only bidder can withdraw bid"
        );
        require(
            _mentorFrames[frameBid.bidder][frameId].closingTime <
                block.timestamp,
            "MeetFrames: frame is not closed"
        );
        require(frameBid.valueLocked > 0, "MeetFrames: no value locked");

        (bool success, ) = frameBid.bidder.call{value: frameBid.valueLocked}(
            ""
        );
        require(success, "MeetFrames: transfer failed");
        frameBid.valueLocked = 0;
    }
}

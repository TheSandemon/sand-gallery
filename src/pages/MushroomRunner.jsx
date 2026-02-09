import React from 'react';
import MushroomRunnerGame from '../components/game/MushroomRunnerGame';
import './MushroomRunner.css';

const MushroomRunner = () => {
    return (
        <div className="mushroom-runner-page">
            <div className="game-header">
                <h1 className="game-title">
                    <span className="mushroom-icon">🍄</span>
                    Mushroom Runner
                    <span className="mushroom-icon">🍄</span>
                </h1>
                <p className="game-subtitle">Collect the greens, dodge the reds!</p>
            </div>

            <div className="game-wrapper">
                <MushroomRunnerGame />
            </div>

            <div className="game-footer">
                <div className="game-tips">
                    <div className="tip">
                        <span className="tip-icon green">🟢</span>
                        <span>Green mushrooms give +10 points</span>
                    </div>
                    <div className="tip">
                        <span className="tip-icon red">🔴</span>
                        <span>Red mushrooms end the game</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MushroomRunner;

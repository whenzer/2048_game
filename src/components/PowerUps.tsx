import React from 'react';
import type { PowerUp } from '../types/game';
import './PowerUps.css';

interface PowerUpsProps {
  powerUps: PowerUp[];
  onUsePowerUp: (id: string) => void;
  disabled?: boolean;
}

const PowerUps: React.FC<PowerUpsProps> = ({ powerUps, onUsePowerUp, disabled }) => {
  return (
    <div className="power-ups">
      <div className="power-ups-title">POWER-UPS</div>
      <div className="power-ups-container">
        {powerUps.map((powerUp) => {
          const isDisabled = disabled || powerUp.uses <= 0 || powerUp.currentCooldown > 0;
          const isOnCooldown = powerUp.currentCooldown > 0;
          const hasNoUses = powerUp.uses <= 0;

          return (
            <button
              key={powerUp.id}
              className={`power-up-button ${isDisabled ? 'disabled' : ''} ${isOnCooldown ? 'cooldown' : ''}`}
              onClick={() => !isDisabled && onUsePowerUp(powerUp.id)}
              disabled={isDisabled}
              title={`${powerUp.name}: ${powerUp.description}`}
            >
              <span className="power-up-icon">{powerUp.icon}</span>
              <span className="power-up-name">{powerUp.name}</span>
              <div className="power-up-info">
                {isOnCooldown ? (
                  <span className="power-up-cooldown">{powerUp.currentCooldown}</span>
                ) : hasNoUses ? (
                  <span className="power-up-empty">×</span>
                ) : (
                  <span className="power-up-uses">{powerUp.uses}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(PowerUps);

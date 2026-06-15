/**
 * Interactive binary / hex / decimal converter.
 *
 * Ported from solst-ice/bin-hex-dec — shows place-value notation,
 * power breakdown, and live cross-base conversion.
 *
 * @see https://github.com/solst-ice/bin-hex-dec
 */

import { useEffect, useRef, useState } from 'react';
import {
  binaryFromDecimal,
  binaryPowerValue,
  binaryProduct,
  decimalFromDigits,
  decimalPowerValue,
  decimalProduct,
  digitsFromDecimal,
  hexFromDecimal,
  hexPowerValue,
  hexProduct,
  isLeadingZero,
  isValidBinaryDigit,
  isValidDecimalDigit,
  isValidHexDigit,
  sumProducts,
  type DigitArray,
} from './conversion';

export default function BinaryConverter() {
  const [decimalNumber, setDecimalNumber] = useState<DigitArray>(['', '', '']);
  const [binaryNumber, setBinaryNumber] = useState<DigitArray>([]);
  const [hexNumber, setHexNumber] = useState<DigitArray>([]);
  const [showPowerNotation, setShowPowerNotation] = useState(false);
  const [showPowerValue, setShowPowerValue] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  const [showTotal, setShowTotal] = useState(true);
  const [showDecimal, setShowDecimal] = useState(true);
  const [showBinary, setShowBinary] = useState(true);
  const [showHex, setShowHex] = useState(true);
  const [showMenus, setShowMenus] = useState(false);

  const decimalRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    if (decimalNumber.every((d) => d === '')) {
      setBinaryNumber([]);
      setHexNumber([]);
      return;
    }
    const decimal = decimalFromDigits(decimalNumber);
    setBinaryNumber(binaryFromDecimal(decimal));
    setHexNumber(hexFromDecimal(decimal));
    if (!showMenus && decimalNumber.some((d) => d !== '')) {
      setShowMenus(true);
    }
  }, [decimalNumber, showMenus]);

  const handleClear = () => setDecimalNumber(['0', '0', '0']);

  const toggleAllVisibility = (checked: boolean) => {
    setShowPowerNotation(checked);
    setShowPowerValue(checked);
    setShowProduct(checked);
    setShowTotal(checked);
  };

  const toggleAllSystems = (checked: boolean) => {
    setShowDecimal(checked);
    setShowBinary(checked);
    setShowHex(checked);
  };

  const handleDecimalChange = (index: number, value: string) => {
    if (!isValidDecimalDigit(value)) return;
    const next = [...decimalNumber];
    next[index] = value;
    setDecimalNumber(next);
    if (value !== '' && index < 2) {
      decimalRefs[index + 1].current?.focus();
      setTimeout(() => decimalRefs[index + 1].current?.select(), 0);
    }
  };

  const handleBinaryChange = (index: number, value: string) => {
    if (!isValidBinaryDigit(value)) return;
    const next = [...binaryNumber];
    next[index] = value;
    const decimal = parseInt(next.join(''), 2) || 0;
    setDecimalNumber(digitsFromDecimal(decimal));
  };

  const handleHexChange = (index: number, value: string) => {
    if (!isValidHexDigit(value)) return;
    const next = [...hexNumber];
    next[index] = value.toUpperCase();
    const decimal = parseInt(next.join(''), 16) || 0;
    setDecimalNumber(digitsFromDecimal(decimal));
  };

  const hasValues = (arr: DigitArray) => arr.some((d) => d !== '');

  const renderPlus = (index: number, max: number, hasDigit: boolean) =>
    index < max && showProduct && hasDigit ? <span className="bc-plus">+</span> : null;

  const renderEqual = (arr: DigitArray) =>
    hasValues(arr) && showTotal ? <span className="bc-equal">=</span> : null;

  return (
    <div className="bc-root">
      <div className={`bc-controls ${showMenus ? 'bc-controls--visible' : ''}`}>
        <div className="bc-checks">
          <label className="bc-check">
            <input
              type="checkbox"
              checked={showPowerNotation && showPowerValue && showProduct && showTotal}
              onChange={(e) => toggleAllVisibility(e.target.checked)}
            />
            Show all details
          </label>
          <label className="bc-check">
            <input type="checkbox" checked={showPowerNotation} onChange={(e) => setShowPowerNotation(e.target.checked)} />
            Powers
          </label>
          <label className="bc-check">
            <input type="checkbox" checked={showPowerValue} onChange={(e) => setShowPowerValue(e.target.checked)} />
            Power values
          </label>
          <label className="bc-check">
            <input type="checkbox" checked={showProduct} onChange={(e) => setShowProduct(e.target.checked)} />
            Products
          </label>
          <label className="bc-check">
            <input type="checkbox" checked={showTotal} onChange={(e) => setShowTotal(e.target.checked)} />
            Total
          </label>
        </div>
        <button type="button" className="csf-btn" onClick={handleClear}>
          Clear
        </button>
      </div>

      <div className={`bc-controls ${showMenus ? 'bc-controls--visible' : ''}`}>
        <div className="bc-checks">
          <label className="bc-check">
            <input
              type="checkbox"
              checked={showDecimal && showBinary && showHex}
              onChange={(e) => toggleAllSystems(e.target.checked)}
            />
            All systems
          </label>
          <label className="bc-check">
            <input type="checkbox" checked={showDecimal} onChange={(e) => setShowDecimal(e.target.checked)} />
            Decimal
          </label>
          <label className="bc-check">
            <input type="checkbox" checked={showBinary} onChange={(e) => setShowBinary(e.target.checked)} />
            Binary
          </label>
          <label className="bc-check">
            <input type="checkbox" checked={showHex} onChange={(e) => setShowHex(e.target.checked)} />
            Hex
          </label>
        </div>
      </div>

      <div className="bc-systems">
        {showDecimal && (
          <section className="bc-system">
            <h3>Decimal (base 10)</h3>
            <div className="bc-row">
              {[0, 1, 2].map((index) => (
                <div key={index} className="bc-digit-group">
                  <div className={`bc-power ${showPowerNotation ? 'bc-power--show' : ''}`}>
                    10<sup>{2 - index}</sup>
                  </div>
                  <div className="bc-calc">
                    <span className={`bc-powval ${showPowerValue ? 'bc-powval--show' : ''}`}>
                      {decimalPowerValue(index)}×
                    </span>
                    <input
                      ref={decimalRefs[index]}
                      type="text"
                      maxLength={1}
                      value={decimalNumber[index]}
                      onChange={(e) => handleDecimalChange(index, e.target.value)}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className={`bc-digit ${isLeadingZero(decimalNumber, index) ? 'bc-digit--faded' : ''}`}
                    />
                  </div>
                  <div className={`bc-product ${showProduct ? 'bc-product--show' : ''}`}>
                    = {decimalNumber[index] ? decimalProduct(decimalNumber, index) : ''}
                  </div>
                  {renderPlus(index, 2, decimalNumber[index] !== '')}
                </div>
              ))}
              {renderEqual(decimalNumber)}
              {hasValues(decimalNumber) && showTotal && (
                <div className="bc-total">{sumProducts(decimalNumber, decimalProduct)}</div>
              )}
            </div>
          </section>
        )}

        {decimalNumber.some((d) => d !== '') && showBinary && (
          <section className="bc-system">
            <h3>Binary (base 2)</h3>
            <div className="bc-row">
              {binaryNumber.map((digit, index) => (
                <div key={index} className="bc-digit-group">
                  <div className={`bc-power ${showPowerNotation ? 'bc-power--show' : ''}`}>
                    2<sup>{binaryNumber.length - 1 - index}</sup>
                  </div>
                  <div className="bc-calc">
                    <span className={`bc-powval ${showPowerValue ? 'bc-powval--show' : ''}`}>
                      {binaryPowerValue(index, binaryNumber.length)}×
                    </span>
                    <input
                      id={`binary-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleBinaryChange(index, e.target.value)}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className={`bc-digit ${isLeadingZero(binaryNumber, index) ? 'bc-digit--faded' : ''}`}
                    />
                  </div>
                  <div className={`bc-product ${showProduct ? 'bc-product--show' : ''}`}>
                    = {digit ? binaryProduct(binaryNumber, index) : ''}
                  </div>
                  {renderPlus(index, binaryNumber.length - 1, digit !== '')}
                </div>
              ))}
              {renderEqual(binaryNumber)}
              {hasValues(binaryNumber) && showTotal && (
                <div className="bc-total">{sumProducts(binaryNumber, binaryProduct)}</div>
              )}
            </div>
          </section>
        )}

        {decimalNumber.some((d) => d !== '') && showHex && (
          <section className="bc-system">
            <h3>Hexadecimal (base 16)</h3>
            <div className="bc-row">
              {hexNumber.map((digit, index) => (
                <div key={index} className="bc-digit-group">
                  <div className={`bc-power ${showPowerNotation ? 'bc-power--show' : ''}`}>
                    16<sup>{hexNumber.length - 1 - index}</sup>
                  </div>
                  <div className="bc-calc">
                    <span className={`bc-powval ${showPowerValue ? 'bc-powval--show' : ''}`}>
                      {hexPowerValue(index, hexNumber.length)}×
                    </span>
                    <input
                      id={`hex-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleHexChange(index, e.target.value)}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className={`bc-digit ${isLeadingZero(hexNumber, index) ? 'bc-digit--faded' : ''}`}
                    />
                  </div>
                  <div className={`bc-product ${showProduct ? 'bc-product--show' : ''}`}>
                    = {digit ? hexProduct(hexNumber, index) : ''}
                  </div>
                  {renderPlus(index, hexNumber.length - 1, digit !== '')}
                </div>
              ))}
              {renderEqual(hexNumber)}
              {hasValues(hexNumber) && showTotal && (
                <div className="bc-total">{sumProducts(hexNumber, hexProduct)}</div>
              )}
            </div>
          </section>
        )}
      </div>

      <style>{`
        .bc-root { display: flex; flex-direction: column; gap: 1rem; }
        .bc-controls { display: none; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between; }
        .bc-controls--visible { display: flex; }
        .bc-checks { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; }
        .bc-check { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: var(--csf-fg-muted); cursor: pointer; }
        .bc-systems { display: flex; flex-direction: column; gap: 1.25rem; }
        .bc-system h3 { font-size: 0.85rem; color: var(--csf-teal); margin-bottom: 0.5rem; font-weight: 600; }
        .bc-row { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 0.25rem; overflow-x: auto; padding: 0.5rem 0; }
        .bc-digit-group { display: flex; flex-direction: column; align-items: center; min-width: 3rem; }
        .bc-power { font-size: 0.65rem; color: var(--csf-fg-faint); height: 1rem; opacity: 0; transition: opacity 0.3s; }
        .bc-power--show { opacity: 1; }
        .bc-calc { display: flex; align-items: center; gap: 0.15rem; }
        .bc-powval { font-size: 0.7rem; color: var(--csf-fg-muted); opacity: 0; transition: opacity 0.3s; }
        .bc-powval--show { opacity: 1; }
        .bc-digit { width: 2.25rem; height: 2.25rem; text-align: center; font-family: var(--csf-mono); font-size: 1rem; border-radius: 6px; border: 1px solid var(--csf-border-strong); background: var(--csf-bg-elev); color: var(--csf-fg); }
        .bc-digit--faded { opacity: 0.4; }
        .bc-product { font-size: 0.65rem; color: var(--csf-fg-faint); height: 1rem; opacity: 0; transition: opacity 0.3s; }
        .bc-product--show { opacity: 1; }
        .bc-plus, .bc-equal { font-size: 1rem; color: var(--csf-fg-muted); padding: 0 0.25rem; align-self: center; }
        .bc-total { font-family: var(--csf-mono); font-size: 1.1rem; font-weight: 600; color: var(--csf-teal); padding: 0.25rem 0.5rem; }
      `}</style>
    </div>
  );
}

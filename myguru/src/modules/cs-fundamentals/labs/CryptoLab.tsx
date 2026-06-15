import CipherDemo from '../crypto/CipherDemo';
import '../cs-fundamentals.css';

export default function CryptoLab() {
  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">Cryptography</h2>
        <p className="csf-lab__desc">
          Walk through AES block cipher rounds — SubBytes, ShiftRows, and AddRoundKey — on a
          16-byte state matrix.
        </p>
      </header>
      <div className="csf-panel">
        <CipherDemo />
      </div>
      <p className="csf-lab__attribution">
        Cipher concepts inspired by{' '}
        <a href="https://github.com/powergr/cipherflow-visualizer" target="_blank" rel="noreferrer">
          powergr/cipherflow-visualizer
        </a>
        .
      </p>
    </div>
  );
}

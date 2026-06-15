import CipherMuseum from '../cipher-museum/CipherMuseum';
import '../cs-fundamentals.css';

export default function CipherMuseumLab() {
  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">Cipher Museum</h2>
        <p className="csf-lab__desc">
          Walk through seven classic ciphers — from Caesar shifts to a simplified Enigma
          machine — and encrypt or decrypt live messages.
        </p>
      </header>
      <div className="csf-panel">
        <CipherMuseum />
      </div>
      <p className="csf-lab__attribution">
        Cipher engines curated from{' '}
        <a href="https://github.com/systemslibrarian/cipher-museum" target="_blank" rel="noreferrer">
          systemslibrarian/cipher-museum
        </a>
        .
      </p>
    </div>
  );
}

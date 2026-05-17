// Basic AES-GCM Encryption Wrapper
// Generates a random AES-GCM key derived from a password for the tenant
// For this demo, we'll use a static password for simplicity, but in production, 
// this should be derived from user input or a secure key exchange.

const ENCRYPTION_KEY = "observikids-secret-key-12345678"; // 32 characters for 256 bit

// Utility to convert string to ArrayBuffer
function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// Utility to convert ArrayBuffer to base64 string
function ab2b64(buf: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Utility to convert base64 string to ArrayBuffer
function b642ab(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export class CryptoService {
  private static async getKey() {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(ENCRYPTION_KEY),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("some-salt"), // In production, generate a random salt and store it
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async encrypt(text: string): Promise<{ ciphertext: string; iv: string }> {
    if (!text) return { ciphertext: "", iv: "" };
    
    const key = await this.getKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      enc.encode(text)
    );

    return {
      ciphertext: ab2b64(encrypted),
      iv: ab2b64(iv)
    };
  }

  static async decrypt(ciphertextB64: string, ivB64: string): Promise<string> {
    if (!ciphertextB64) return "";
    
    const key = await this.getKey();
    const iv = b642ab(ivB64);
    const ciphertext = b642ab(ciphertextB64);

    try {
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: new Uint8Array(iv)
        },
        key,
        ciphertext
      );
      
      const dec = new TextDecoder();
      return dec.decode(decrypted);
    } catch (e) {
      console.error("Decryption failed", e);
      return "[Conteúdo não pôde ser descriptografado]";
    }
  }
}

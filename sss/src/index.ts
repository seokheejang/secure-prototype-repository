import { split, combine } from 'shamir-secret-sharing';
import * as bip39 from 'bip39';
import * as crypto from 'crypto';

const toUint8Array = (data: string) => new TextEncoder().encode(data);

async function main() {
  // 사용자 입력을 분할하는 예제
  const input = 'text';

  const mnemonic = bip39.generateMnemonic();
  console.log('Generated Mnemonic:', mnemonic);

  const secret = toUint8Array(mnemonic);
  console.log('Original Secret (Mnemonic as Uint8Array):', secret);

  const [share1a, share2a, share3a] = await split(secret, 3, 2);
  console.log('Share 1:', btoa(String.fromCharCode(...share1a)));
  console.log('Share 2:', btoa(String.fromCharCode(...share2a)));
  console.log('Share 3:', btoa(String.fromCharCode(...share3a)));

  const reconstructedA = await combine([share1a, share3a]);
  console.log('Reconstructed Secret (from Share 1 and Share 3):', btoa(String.fromCharCode(...reconstructedA)));

  const secretBase64 = btoa(String.fromCharCode(...secret));
  console.log('Original Secret Base64:', secretBase64);
  console.log('Reconstructed Secret matches Original Secret:', reconstructedA.length === secret.length && btoa(String.fromCharCode(...reconstructedA)) === secretBase64); // true

  // 복구된 비밀을 다시 니모닉으로 변환
  const reconstructed = await combine([share1a, share3a]);
  console.log('Reconstructed Secret (from Share 1 and Share 3):', btoa(String.fromCharCode(...reconstructed)));
  const reconstructedMnemonic = new TextDecoder().decode(reconstructed);
  console.log('Reconstructed Mnemonic:', reconstructedMnemonic);
  console.log('Reconstructed Mnemonic matches Original:', reconstructedMnemonic === mnemonic); // true

  // 랜덤 엔트로피를 분할하는 예제
  const randomEntropy = crypto.getRandomValues(new Uint8Array(16));
  console.log('Random Entropy:', btoa(String.fromCharCode(...randomEntropy)));

  const [share1b, share2b, share3b] = await split(randomEntropy, 3, 2);
  console.log('Share 1 (Random Entropy):', btoa(String.fromCharCode(...share1b)));
  console.log('Share 2 (Random Entropy):', btoa(String.fromCharCode(...share2b)));
  console.log('Share 3 (Random Entropy):', btoa(String.fromCharCode(...share3b)));

  const reconstructedB = await combine([share2b, share3b]);
  console.log('Reconstructed Random Entropy (from Share 2 and Share 3):', btoa(String.fromCharCode(...reconstructedB)));

  const randomEntropyBase64 = btoa(String.fromCharCode(...randomEntropy));
  console.log('Original Random Entropy Base64:', randomEntropyBase64);
  console.log('Reconstructed Random Entropy matches Original:', btoa(String.fromCharCode(...reconstructedB)) === randomEntropyBase64); // true

  // 대칭키를 분할하는 예제
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  const exportedKeyBuffer = await crypto.subtle.exportKey('raw', key);
  const exportedKey = new Uint8Array(exportedKeyBuffer);
  console.log('Exported Key (Symmetric Key):', btoa(String.fromCharCode(...exportedKey)));

  const [share1c, share2c, share3c] = await split(exportedKey, 3, 2);
  console.log('Share 1 (Symmetric Key):', btoa(String.fromCharCode(...share1c)));
  console.log('Share 2 (Symmetric Key):', btoa(String.fromCharCode(...share2c)));
  console.log('Share 3 (Symmetric Key):', btoa(String.fromCharCode(...share3c)));

  const reconstructedC = await combine([share2c, share1c]);
  console.log('Reconstructed Symmetric Key (from Share 1 and Share 2):', btoa(String.fromCharCode(...reconstructedC)));

  const exportedKeyBase64 = btoa(String.fromCharCode(...exportedKey));
  console.log('Original Symmetric Key Base64:', exportedKeyBase64);
  console.log('Reconstructed Symmetric Key matches Original:', btoa(String.fromCharCode(...reconstructedC)) === exportedKeyBase64); // true
}

main();

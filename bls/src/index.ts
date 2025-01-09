import { bls12_381 as bls } from '@noble/curves/bls12-381';
import * as bip39 from 'ethereum-cryptography/bip39/index.js';
import { wordlist } from 'ethereum-cryptography/bip39/wordlists/english.js';
import { HDKey } from 'ethereum-cryptography/hdkey.js';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function stringToHex(message: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(message);
}

async function main() {
  const message = 'security';
  const mnemonic = bip39.generateMnemonic(wordlist);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  const derivedKey = hdKey.derive("m/44'/60'/0'/0/0");
  const uint8ArrPrivateKey = derivedKey.privateKey;
  const hexPrivateKey = bytesToHex(uint8ArrPrivateKey as Uint8Array);

  console.log('Generated Mnemonic:', mnemonic);
  console.log('uint8ArrPrivateKey:', uint8ArrPrivateKey);
  console.log('hexPrivateKey:', hexPrivateKey);

  const hexMessage = stringToHex(message);
  const publicKey = bls.getPublicKey(hexPrivateKey);
  const signature = bls.sign(hexMessage, hexPrivateKey);
  const isValid = bls.verify(signature, hexMessage, publicKey);

  console.log({ publicKey, signature, isValid });

  // G2 키와 G1 서명 (짧은 서명 예제)
  // getPublicKeyForShortSignatures(privateKey)
  // signShortSignature(message, privateKey)
  // verifyShortSignature(signature, message, publicKey)
  // aggregateShortSignatures(signatures)

  // DST (Domain Separation String) 사용
  const htfEthereum = { DST: 'BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_POP_' };
  const signatureEth = bls.sign(hexMessage, hexPrivateKey, htfEthereum);
  const isValidEth = bls.verify(signatureEth, hexMessage, publicKey, htfEthereum);
  console.log('Ethereum DST signature valid?', isValidEth);

  // 공개 키를 생성하여 집합화
  const privateKey1 = bls.utils.randomPrivateKey();
  const privateKey2 = bls.utils.randomPrivateKey();

  const publicKey1 = bls.getPublicKey(bytesToHex(privateKey1));
  const publicKey2 = bls.getPublicKey(bytesToHex(privateKey2));

  const signature1 = bls.sign(hexMessage, privateKey1);
  const signature2 = bls.sign(hexMessage, privateKey2);

  const aggregatedKey = bls.aggregatePublicKeys([publicKey1, publicKey2]);
  const aggregatedSignature = bls.aggregateSignatures([signature1, signature2]);
  const aggregatedIsValid = bls.verify(aggregatedSignature, hexMessage, aggregatedKey);

  console.log(bytesToHex(privateKey1), bytesToHex(privateKey2));
  console.log({ aggregatedKey, aggregatedSignature, aggregatedIsValid });

  // Pairing 예제
  // const pairingResult = bls.pairing(PointG1, PointG2);
  // const pairingResultNoFinalExp = bls.pairing(PointG1, PointG2, false);
  // console.log(pairingResult, pairingResultNoFinalExp);

  // 기타 수학적 연산 (예시)
  // const finalExpResult = bls.fields.Fp12.finalExponentiate(bls.fields.Fp12.mul(PointG1, PointG2));
  // console.log(finalExpResult);
}

main();

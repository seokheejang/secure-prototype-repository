package main

import (
	"crypto"
	"encoding/hex"
	"fmt"
	"log"

	"github.com/ThalesIgnite/crypto11"
	"golang.org/x/crypto/sha3"
)

func main() {
	// 1. crypto11 설정 구성 (SoftHSM2 PKCS#11 라이브러리, 토큰 라벨, PIN 지정)
	cfg := &crypto11.Config{
		// PKCS#11 모듈 경로 (Brew로 설치한 softhsm2 경로)
		Path:       "/opt/homebrew/Cellar/softhsm/2.6.1/lib/softhsm/libsofthsm2.dylib",
		TokenLabel: "my-soft-hsm-2", // 토큰 생성 시 지정한 label
		Pin:        "1234",          // 토큰 초기화 시 사용한 PIN
	}

	// 2. crypto11 컨텍스트 구성 (내부적으로 로그인, 세션 관리 등을 처리)
	ctx, err := crypto11.Configure(cfg)
	if err != nil {
		log.Fatalf("crypto11 구성 실패: %v", err)
	}
	defer ctx.Close()

	// 3. HSM에 등록된 개인키 검색 (라벨 "my-key-id")
	privKey, err := ctx.FindKeyPair(nil, []byte("my-key-id"))
	if err != nil {
		log.Fatalf("개인키 검색 실패: %v", err)
	}
	if privKey == nil {
		log.Fatalf("라벨 'my-key-id'에 해당하는 개인키를 찾을 수 없습니다")
	}
	fmt.Println("HSM에서 개인키를 찾았습니다.")

	// 4. 서명할 메시지 및 Keccak256 해시 계산 (Ethereum에서는 Keccak256 해시 사용)
	message := []byte("Hello, Ethereum!")
	hasher := sha3.NewLegacyKeccak256() // Ethereum의 Keccak256 (SHA-3의 레거시 버전)
	_, err = hasher.Write(message)
	if err != nil {
		log.Fatalf("해시 계산 실패: %v", err)
	}
	digest := hasher.Sum(nil)
	fmt.Printf("메시지 해시 (Keccak256): %s\n", hex.EncodeToString(digest))

	// 5. crypto.Signer 인터페이스를 사용해 서명
	//
	// crypto11를 통해 얻은 privKey는 crypto.Signer 인터페이스를 구현합니다.
	// 이미 해시를 계산한 경우, Sign()의 세 번째 인자는 crypto.Hash(0)을 전달하여 해시함수를
	// 다시 적용하지 않도록 합니다.
	signature, err := privKey.(crypto.Signer).Sign(nil, digest, crypto.Hash(0))
	if err != nil {
		log.Fatalf("서명 실패: %v", err)
	}
	fmt.Printf("서명 (r||s, 64바이트): %s\n", hex.EncodeToString(signature))

	// ※ 주의: Ethereum의 경우 최종 서명은 (r, s, v)로 구성됩니다.
	//    HSM 서명은 r과 s만 반환하므로, recovery id (v)는 별도의 계산 로직을 통해 구해야 합니다.
}

package main

import (
	"fmt"
	"log"

	"github.com/miekg/pkcs11"
)

func main() {
	// PKCS#11 라이브러리 경로
	pkcs11Path := "/opt/homebrew/Cellar/softhsm/2.6.1/lib/softhsm/libsofthsm2.dylib"

	// PKCS#11 라이브러리 로드
	p := pkcs11.New(pkcs11Path)
	if p == nil {
		log.Fatalf("failed to load PKCS#11 library from %s", pkcs11Path)
	}
	defer p.Finalize()

	// PKCS#11 초기화
	fmt.Println("Initializing PKCS#11...")
	err := p.Initialize()
	if err != nil {
		log.Fatalf("failed to initialize PKCS#11 library: %v", err)
	}
	fmt.Println("PKCS#11 initialized successfully.")

	// 슬롯 정보 가져오기
	slots, err := p.GetSlotList(true)
	if err != nil {
		log.Fatalf("failed to get slots: %v", err)
	}

	// 첫 번째 슬롯 열기
	slot := slots[0]
	session, err := p.OpenSession(slot, pkcs11.CKF_SERIAL_SESSION|pkcs11.CKF_RW_SESSION)
	if err != nil {
		log.Fatalf("failed to open session: %v", err)
	}
	defer p.CloseSession(session)

	// 객체 찾기 (예시로 키 검색)
	err = p.FindObjectsInit(session, []*pkcs11.Attribute{
		pkcs11.NewAttribute(pkcs11.CKA_LABEL, "my-key-id"), // 라벨을 기반으로 검색
	})
	if err != nil {
		log.Fatalf("failed to initialize object search: %v", err)
	}
	defer p.FindObjectsFinal(session)

	objects, _, err := p.FindObjects(session, 10)
	if err != nil {
		log.Fatalf("failed to find objects: %v", err)
	}

	for _, object := range objects {
		attributes, err := p.GetAttributeValue(session, object, []*pkcs11.Attribute{
			pkcs11.NewAttribute(pkcs11.CKA_LABEL, nil),
		})
		if err != nil {
			log.Fatalf("failed to get object attributes: %v", err)
		}
		fmt.Printf("Found object with label: %v\n", attributes[0].Value)
	}
}

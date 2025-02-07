# pkcs11

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install softhsm


```

라이브러리 파일 찾기

```bash
brew list softhsm
# ...
# > /opt/homebrew/Cellar/softhsm/2.6.1/lib/softhsm/ (2 files)
# ...

ls /opt/homebrew/Cellar/softhsm/2.6.1/lib/softhsm/
# > libsofthsm2.a  libsofthsm2.so

cp /opt/homebrew/Cellar/softhsm/2.6.1/lib/softhsm/libsofthsm2.so /opt/homebrew/Cellar/softhsm/2.6.1/lib/softhsm/libsofthsm2.dylib
```

slot 생성

```bash
softhsm2-util --init-token --slot 0 --label "my-soft-hsm"
```

개인 키 생성 (PKCS#8 형식으로 저장)

```bash
openssl genpkey -algorithm RSA -out private_key.pem
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

slot 확인

```bash
softhsm2-util --show-slots
```

SoftHSM에 PKCS#8 형식 개인 키 등록

```bash
softhsm2-util --slot <SLOT_MUMBER> --pin 1234 --label "my-key-id" --id 12345678 --import private_key.pem
```

hsm 키 확인

```bash
go run main.go
```
```bash
# 예상 결과
Initializing PKCS#11...
PKCS#11 initialized successfully.
Found object with label: [109 121 45 107 101 121 45 105 100]
```

slot 삭제

```bash
softhsm2-util --slot 0 --pin 1234 --token "my-soft-hsm" --delete-token
```

---

ethereum

```bash
softhsm2-util --init-token --slot 1 --label "my-soft-hsm-2"
```

```bash
openssl ecparam -name secp256k1 -genkey -noout -out secp256k1_key.pem

openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in secp256k1_key.pem -out secp256k1_key_pkcs8.pem

```

```bash
softhsm2-util --slot 1923986552 --pin 1234 --label "my-key-id" --id 12345678 --import secp256k1_key_pkcs8.pem
```

```bash
softhsm2-util --slot 1 --pin 1234 --token "my-soft-hsm-2" --delete-token
```

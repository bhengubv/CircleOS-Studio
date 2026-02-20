# CircleOS Studio

**studio.circleos.co.za**

CircleOS Studio is the first-party app studio for CircleOS. Apps built here are published to SleptOn and serve a second purpose: they are living proof that CircleOS is a real, buildable platform.

---

## The Rule

| App type | Build target |
|---|---|
| Built-in (ships with the OS) | Native AOSP/Java **+** MAUI cross-platform |
| App store only | MAUI cross-platform |

Built-in apps always have two versions:
- A **native Java** version in the CircleOS repo (`vendor/circle/apps/<AppName>/`) — platform-signed, hardware-integrated, baked into the ROM.
- A **MAUI cross-platform** version here — Android, iOS, macOS, Windows — published to SleptOn like any other app.

The MAUI version is not a downgrade. It is proof that the same product can be built by any developer without needing OS-level access.

---

## Apps

| App | Type | SleptOn listing |
|---|---|---|
| [HomeCinema](./HomeCinema/) | Built-in + MAUI | Media player |

---

## Getting Started

```bash
# Clone
git clone https://github.com/thegeeknetwork/CircleOS-Studio.git
cd CircleOS-Studio

# Build HomeCinema for Android
dotnet build HomeCinema/HomeCinema.csproj -f net10.0-android

# Build for iOS
dotnet build HomeCinema/HomeCinema.csproj -f net10.0-ios
```

Requirements: .NET 10 SDK, MAUI workload (`dotnet workload install maui`).

---

## Publishing to SleptOn

Apps in this repo are submitted to SleptOn through the standard developer portal at `https://slepton-api.thegeeknetwork.co.za`. No special access required — the same process any external developer follows.

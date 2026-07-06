# Device — BleepCare ESP32 Wristband

Custom-built wearable that reads patient vitals, detects falls and collisions, and publishes live data to the cloud over GPRS or WiFi. On any emergency it fires an MQTT alert, sounds a buzzer, sends an SMS, and places a voice call to the caregiver.

---

## Hardware Components

| Component | Role | Interface |
|---|---|---|
| ESP32 Dev Module | Main microcontroller | — |
| MAX30102 | Heart rate + SpO₂ | I2C (GPIO 21/22) |
| MPU6050 | Fall / collision detection | I2C (GPIO 21/22) |
| NEO-6M GPS | Location + UTC time | UART2 (GPIO 16/17) |
| SIM900 GSM | GPRS data + SMS + voice calls | UART1 (GPIO 25/26) |
| LM35 | Body temperature | Analog (GPIO 34) |
| ST7789 240×280 TFT | Live vitals display | SPI |
| Buzzer | SOS + alert tones | GPIO 14 |
| SOS Button | 3-second hold-to-confirm emergency | GPIO 13 |
| 3.7V LiPo Battery (2800mAh) | Primary power source | — |
| TP4056 | LiPo charging module | — |
| XL6009 DC-DC Boost Converter | Steps up LiPo voltage to 5V for ESP32 and peripherals | — |

---

## Wiring

| ESP32 Pin | Connected to |
|---|---|
| GPIO 18 (SCK) | TFT SCLK |
| GPIO 23 (MOSI) | TFT MOSI |
| GPIO 27 | TFT DC |
| GPIO 33 | TFT CS |
| GPIO 4 | TFT RST |
| GPIO 21 (SDA) | MAX30102 SDA, MPU6050 SDA |
| GPIO 22 (SCL) | MAX30102 SCL, MPU6050 SCL |
| GPIO 16 (RX2) | NEO-6M TX |
| GPIO 17 (TX2) | NEO-6M RX |
| GPIO 25 | SIM900 RX |
| GPIO 26 | SIM900 TX |
| GPIO 34 | LM35 output |
| GPIO 14 | Buzzer |
| GPIO 13 | SOS button (other leg to GND) |
| **Power** | **Connected to** |
| XL6009 VOUT (5V) | ESP32 VIN, SIM900 VCC |
| XL6009 GND | ESP32 GND, SIM900 GND |
| SIM900 VCC | 5V from XL6009 (must supply up to 2A — use thick wire) |
| SIM900 GND | Common GND |
| TP4056 OUT+ | XL6009 VIN+ |
| TP4056 OUT- | XL6009 VIN- (GND) |
| LiPo B+ | TP4056 B+ |
| LiPo B- | TP4056 B- |

---

## Setup Instructions

### 1. Install Arduino IDE

Download and install [Arduino IDE 2.x](https://www.arduino.cc/en/software)

### 2. Install ESP32 Board Package

1. Open Arduino IDE → **File → Preferences**
2. Under *Additional boards manager URLs* paste:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Go to **Tools → Board → Boards Manager**
4. Search `esp32` → install the package by Espressif Systems

### 3. Install Required Libraries

Go to **Sketch → Include Library → Manage Libraries** and install:

| Library | Author |
|---|---|
| Adafruit GFX Library | Adafruit |
| Adafruit ST7735 and ST7789 Library | Adafruit |
| TinyGPSPlus | Mikal Hart |
| SparkFun MAX3010x Pulse and Proximity Sensor | SparkFun |
| MPU6050 | Electronic Cats |
| PubSubClient | Nick O'Leary |

### 4. Configure the Firmware

Open `bleepcare-firmware.ino` and update these defines at the top:

```cpp
// WiFi credentials (supplementary path)
#define WIFI_SSID        "YourNetworkName"
#define WIFI_PASS        "YourPassword"

// Caregiver phone number (international format)
#define CAREGIVER_NUMBER "+256XXXXXXXXX"

// Unique device identifier
#define DEVICE_ID        "BLEEP-1234"

// SIM card APN — "internet" works for MTN and Airtel Uganda
#define GPRS_APN         "internet"
```

### 5. Flash the Device

1. Connect the ESP32 to your computer via USB
2. In Arduino IDE select:
   - **Tools → Board → ESP32 Dev Module**
   - **Tools → Port** → select your COM port (e.g. COM5 on Windows, /dev/ttyUSB0 on Linux)
3. Click **Upload**

### 6. Verify

Open **Tools → Serial Monitor** at **115200 baud**. You should see:

```
[GSM] SIM ready
[GSM] Network OK
[MQTT] Connecting... OK
UI Ready.
[MQTT] → bleepcare/BLEEP-1234/vitals
```

Vitals publish every 30 seconds. If WiFi is unavailable the device automatically falls back to GPRS.

---

## Connectivity

The SIM900 GSM module is the **primary** data channel — it opens a raw TCP socket to the MQTT broker over GPRS using the SIM card's data plan. This is the managed connectivity included in the patient's monthly BleepCare subscription.

WiFi via the ESP32's built-in radio is a **supplementary** path — used automatically when a known WiFi network is in range to reduce SIM data consumption.

---

## Alert Types

| Alert | Trigger |
|---|---|
| `THRESHOLD` | HR < 50 or > 120 BPM · SpO₂ < 92% · Temp < 35°C or > 37.5°C |
| `FALL` | Fall score > 60/100 (free-fall + impact + gyro stillness) |
| `COLLISION` | Collision score > 65/100 (peak-g + rise time + rotational jolt) |
| `SOS` | Button held for 3 seconds |

All four alert types simultaneously trigger: MQTT alert frame, on-device emergency screen, buzzer pattern, SMS to caregiver, and voice call to caregiver.

---

## MQTT Topics

| Topic | Interval | Content |
|---|---|---|
| `bleepcare/{deviceId}/vitals` | Every 30 s | Full vitals frame |
| `bleepcare/{deviceId}/alert` | Immediately on event | Vitals + alert type |

Broker: `broker.hivemq.com` · Port: `1883`

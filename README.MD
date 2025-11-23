# Celestia

Bot Discord tự động timeout ngẫu nhiên người dùng

## Tính năng

### Timeout ngẫu nhiên

- Tự động timeout người dùng theo tỉ lệ có thể điều chỉnh
- Thời gian timeout ngẫu nhiên từ min đến max
- Hiển thị tin nhắn ngẫu nhiên khi timeout
- Tin nhắn miễn nhiễm cho người có quyền cao

### Whitelist

- Whitelist theo kênh - Bỏ qua timeout trong kênh cụ thể
- Whitelist theo vai trò - User có vai trò được miễn nhiễm
- Whitelist theo category - Tất cả kênh trong category được bỏ qua

### Bảng xếp hạng

- Theo dõi số lần bị timeout của mỗi người
- Tính tổng thời gian timeout
- Reset tự động vào 0h thứ 2 hàng tuần
- Phân trang khi có nhiều hơn 10 người
- Sắp xếp theo số lần, sau đó theo tổng thời gian

### Quản lý cấu hình

- Thay đổi tỉ lệ timeout (0-100%)
- Điều chỉnh thời gian timeout min/max
- Bật/tắt hiển thị tin nhắn miễn nhiễm
- Thêm/xóa câu trả lời tùy chỉnh
- Cấu hình lưu trong settings.json

## Cài đặt

### Yêu cầu

- Node.js 20 hoặc cao hơn
- Docker và Docker Compose (tùy chọn)

### Cài đặt thủ công

1. Clone repository

```bash
git clone https://github.com/StrinovaVN/Celestia.git
cd Celestia
```

2. Cài đặt dependencies

```bash
npm install
```

3. Cấu hình file .env

```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
GUILD_ID=your_guild_id_here
MAX_TIME=120
MIN_TIME=60
RATE=10
SHOW_IMMUNE_MESSAGE=true
```

4. Chạy bot

```bash
npm start
```

### Cài đặt với Docker

1. Build và chạy với Docker Compose

```bash
docker-compose up -d
```

2. Xem logs

```bash
docker-compose logs -f
```

3. Dừng bot

```bash
docker-compose down
```

> [!WARNING]  
> Khi chạy với docker, lưu ý cấp quyền để docker có thể đọc file từ ``src/data``

## Commands

### Quản lý cấu hình

**`/changerate <rate>`**

- Thay đổi tỉ lệ timeout (0-100)
- Ví dụ: 10 = 10%, 0.5 = 0.5%
- Yêu cầu: Quyền Moderate Members

**`/settime <min> <max>`**

- Thay đổi thời gian timeout
- min: Thời gian tối thiểu (giây)
- max: Thời gian tối đa (giây)
- Yêu cầu: Quyền Moderate Members

**`/immute`**

- Bật/tắt hiển thị tin nhắn cho người miễn nhiễm
- Yêu cầu: Quyền Moderate Members

**`/settings`**

- Xem cấu hình hiện tại của bot
- Hiển thị rate, min/max time, số respond
- Yêu cầu: Quyền Moderate Members

### Quản lý respond

**`/addrespond <message>`**

- Thêm câu trả lời timeout mới
- Sử dụng ${username} và ${time} làm placeholder
- Ví dụ: "${username} giẫm phải mìn, trở lại sau ${time} giây"
- Yêu cầu: Quyền Moderate Members

### Whitelist

**`/channelwhitelist add/remove/list [channel]`**

- add: Thêm kênh vào whitelist
- remove: Xóa kênh khỏi whitelist
- list: Xem danh sách kênh whitelist
- Yêu cầu: Quyền Moderate Members

**`/rolewhitelist add/remove/list [role]`**

- add: Thêm vai trò vào whitelist
- remove: Xóa vai trò khỏi whitelist
- list: Xem danh sách vai trò whitelist
- Yêu cầu: Quyền Moderate Members

**`/categorywhitelist add/remove/list [category]`**

- add: Thêm category vào whitelist
- remove: Xóa category khỏi whitelist
- list: Xem danh sách category whitelist
- Yêu cầu: Quyền Moderate Members

### Bảng xếp hạng

**`/leaderboard`**

- Xem top người bị timeout nhiều nhất trong tuần
- Hiển thị thứ hạng, số lần, tổng thời gian

**`/resetleaderboard`**

- Reset bảng xếp hạng
- Yêu cầu: Quyền Administrator

## Cấu trúc thư mục

```txt
Celestia/
├── src/
│   ├── bot.js                  # Main file
│   ├── commands/               # Slash commands
│   │   ├── addRespond.js
│   │   ├── categoryWhitelist.js
│   │   ├── channelWhitelist.js
│   │   ├── changRate.js
│   │   ├── leaderboard.js
│   │   ├── permImmute.js
│   │   ├── resetLeaderboard.js
│   │   ├── roleWhitelist.js
│   │   ├── settings.js
│   │   └── setTime.js
│   ├── data/                   
│   │   ├── antiRespond.json    # Staff timeout respond message
│   │   ├── respond.json        # Timeout respond message
│   │   ├── settings.json       # Config
│   │   └── weeklyLeaderBoard.json  # Leaderboard
│   ├── functions/              # Helper functions
│   │   ├── emote.js           # Emote IDs
│   │   ├── leaderboard.js     # Logic leaderboard
│   │   ├── randomAntiQuote.js # Random immunity quote
│   │   ├── randomQuote.js     # Random timeout quote
│   │   └── randomTime.js      # Random timeout duration
│   └── return/                 # Message formatters
│       ├── default.js         # Format timeout message
│       ├── immunity.js        # Format immunity message
│       └── leaderboard.js     # Format leaderboard embed
├── .dockerignore
├── .env                        
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

## Cách hoạt động

### Timeout flow

1. User gửi tin nhắn trong server
2. Bot kiểm tra whitelist (channel, category, role)
3. Random theo tỉ lệ đã đặt
4. Nếu trúng:
   - Kiểm tra user có thể timeout không
   - Nếu có: Timeout và hiển thị respond từ respond.json
   - Nếu không (immunity): Hiển thị tin nhắn từ antiRespond.json (nếu bật)
5. Ghi vào leaderboard (nếu timeout thành công)

### Whitelist priority

1. Kênh cụ thể
2. Category của kênh
3. Vai trò của user

### Immunity types

- **permission immune**: User có quyền đặc biệt (admin, owner)
- **role higher**: Role của user cao hơn role của bot

## Placeholders

### Respond messages

- `${username}` - Mention user bị timeout
- `${time}` - Thời gian timeout (giây)

### Anti-respond messages

- `${username}` - Mention user có immunity
- `${immune_type}` - Loại miễn nhiễm (permission immune hoặc role higher)

## Quyền yêu cầu cho bot

Bot cần các quyền sau:

- **Moderate Members** - Để timeout người dùng
- **Send Messages** - Để gửi tin nhắn
- **View Channels** - Để đọc tin nhắn
- **Use Slash Commands** - Để đăng ký commands

## Settings format

File `settings.json` lưu cấu hình:

```json
{
    "rate": 10,
    "minTime": 60,
    "maxTime": 120,
    "showImmuneMessage": true,
    "whitelistChannels": ["channel_id_1", "channel_id_2"],
    "whitelistRoles": ["role_id_1", "role_id_2"],
    "whitelistCategories": ["category_id_1"]
}
```

## Tùy chỉnh emotes

Sửa file `src/functions/emote.js`:

```javascript
const emotes = {
    timeout: '<:your_timeout_emote:id>',
    immunity: '<:your_immunity_emote:id>'
};
```

> [!WARNING]  
> Bot chỉ hoạt động trong guild đã đặt trong GUILD_ID
>
> Bot không timeout chính nó hoặc các bot khác
>
> Leaderboard tự động reset vào 0h thứ 2 hàng tuần
>
> Settings được lưu trong settings.json, ưu tiên cao hơn .env
>
> Cần permission Moderate Members để bot có thể timeout
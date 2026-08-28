-- ====================================================================================
-- BSB PICKLEBALL CLUB - POSTGRESQL / SUPABASE DATABASE SCHEMA
-- Compatible with Supabase, Vercel Postgres, Neon, Cloud SQL
-- ====================================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
CREATE TYPE booking_type_enum AS ENUM ('clb', 'minitour', 'fixed', 'casual', 'event');
CREATE TYPE booking_status_enum AS ENUM ('HOLD', 'PENDING', 'CONFIRMED', 'CHECKIN_PENDING', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW', 'CANCELLED', 'REJECTED');
CREATE TYPE court_status_enum AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');
CREATE TYPE club_status_enum AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'deposit_paid');

-- 3. Table: courts (Hệ thống 6 sân)
CREATE TABLE IF NOT EXISTS courts (
    id TEXT PRIMARY KEY DEFAULT 'court-' || gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'indoor', -- 'indoor' | 'outdoor' | 'center_court'
    surface TEXT NOT NULL DEFAULT 'Laykold 8 lớp USAPA',
    hourly_rate_normal NUMERIC(12, 2) NOT NULL DEFAULT 150000,
    hourly_rate_peak NUMERIC(12, 2) NOT NULL DEFAULT 220000,
    image_url TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    status court_status_enum NOT NULL DEFAULT 'ACTIVE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: clubs (Câu lạc bộ - Chỉ Admin thêm/sửa, Người đặt chỉ chọn)
CREATE TABLE IF NOT EXISTS clubs (
    id TEXT PRIMARY KEY DEFAULT 'club-' || gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    tagline TEXT,
    description TEXT,
    leader_name VARCHAR(255) NOT NULL,
    leader_phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    schedule_description TEXT,
    regular_days JSONB DEFAULT '[]'::jsonb, -- [1, 3, 5]
    regular_time VARCHAR(100),
    assigned_court_ids JSONB DEFAULT '[]'::jsonb,
    member_count INT DEFAULT 0,
    dupr_level VARCHAR(100) DEFAULT 'DUPR 2.5 - 3.5',
    monthly_fee NUMERIC(12, 2) DEFAULT 500000,
    badge VARCHAR(100) DEFAULT 'CLB BSB',
    cover_image TEXT,
    color VARCHAR(20) DEFAULT '#11385E',
    tags JSONB DEFAULT '[]'::jsonb,
    status club_status_enum NOT NULL DEFAULT 'ACTIVE',
    is_open_for_members BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table: bookings (Lịch đặt sân 5 loại)
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY DEFAULT 'bk-' || gen_random_uuid(),
    booking_code VARCHAR(100) UNIQUE NOT NULL,
    booking_type booking_type_enum NOT NULL DEFAULT 'casual',
    court_id TEXT REFERENCES courts(id) ON DELETE SET NULL,
    court_name VARCHAR(255),
    court_ids JSONB DEFAULT '[]'::jsonb, -- Dành cho Sự kiện / Minitour nhiều sân
    
    -- Thông tin khách hàng / đại diện
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    
    -- Liên kết CLB (khi booking_type = 'clb')
    club_id TEXT REFERENCES clubs(id) ON DELETE SET NULL,
    club_name VARCHAR(255),
    
    -- Dành cho Minitour / Sự kiện
    title VARCHAR(255),
    organizer_name VARCHAR(255),
    participant_count INT DEFAULT 4,
    team_count INT DEFAULT 0,
    event_type VARCHAR(100),
    selected_services JSONB DEFAULT '[]'::jsonb,
    setup_minutes INT DEFAULT 0,
    cleanup_minutes INT DEFAULT 0,
    
    -- Thời gian
    date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL, -- 'HH:mm'
    end_time VARCHAR(20) NOT NULL,   -- 'HH:mm'
    duration_hours NUMERIC(4, 2) DEFAULT 1,
    
    -- Lịch lặp cố định
    selected_days JSONB DEFAULT '[]'::jsonb,
    duration_months INT DEFAULT 1,
    
    -- Tài chính
    subtotal NUMERIC(12, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    deposit_amount NUMERIC(12, 2) DEFAULT 0,
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    
    -- Trạng thái & Vòng đời Check-in / No-Show
    booking_status booking_status_enum NOT NULL DEFAULT 'PENDING',
    hold_expires_at TIMESTAMPTZ, -- Tự giải phóng sau 5 phút nếu là HOLD
    checkin_time TIMESTAMPTZ,    -- Mốc giờ nhân viên xác nhận khách check-in tại quầy
    no_show_reason TEXT,         -- Lý do ghi nhận khi khách không đến (No-show)
    last_reminder_sent_at TIMESTAMPTZ, -- Thời điểm gửi nhắc nhở check-in lần cuối
    notes TEXT,
    created_by_role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table: booking_slots (Slot chi tiết từng sân cho kiểm tra chống trùng)
CREATE TABLE IF NOT EXISTS booking_slots (
    id TEXT PRIMARY KEY DEFAULT 'slot-' || gen_random_uuid(),
    booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
    court_id TEXT REFERENCES courts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table: minitours (Giải đấu Minitour)
CREATE TABLE IF NOT EXISTS minitours (
    id TEXT PRIMARY KEY DEFAULT 'tour-' || gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    banner_image TEXT,
    date DATE NOT NULL,
    time_range VARCHAR(100) NOT NULL,
    location TEXT NOT NULL,
    format VARCHAR(50) DEFAULT 'knockout_8',
    category VARCHAR(100) DEFAULT 'Đôi Nam',
    dupr_bracket VARCHAR(100) DEFAULT 'Level 3.0',
    entry_fee NUMERIC(12, 2) DEFAULT 500000,
    prize_total NUMERIC(12, 2) DEFAULT 10000000,
    prize_first TEXT,
    prize_second TEXT,
    prize_third TEXT,
    max_teams INT DEFAULT 8,
    teams JSONB DEFAULT '[]'::jsonb,
    matches JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'registration_open',
    rules JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table: pricing_rules (Cấu hình bảng giá linh hoạt)
CREATE TABLE IF NOT EXISTS pricing_rules (
    id TEXT PRIMARY KEY DEFAULT 'pr-' || gen_random_uuid(),
    court_id TEXT REFERENCES courts(id) ON DELETE CASCADE,
    day_type VARCHAR(50) NOT NULL, -- 'weekday' | 'weekend' | 'holiday'
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    booking_type booking_type_enum,
    price_per_hour NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Table: court_blocks (Khóa sân bảo trì / nội bộ)
CREATE TABLE IF NOT EXISTS court_blocks (
    id TEXT PRIMARY KEY DEFAULT 'block-' || gen_random_uuid(),
    court_id TEXT REFERENCES courts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Table: audit_logs (Nhật ký thao tác admin)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT 'log-' || gen_random_uuid(),
    admin_id VARCHAR(100) NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================================
-- INDEXES & PERFORMANCE OPTIMIZATION (Chống trùng & truy vấn siêu nhanh)
-- ====================================================================================
CREATE INDEX IF NOT EXISTS idx_bookings_date_court ON bookings(date, court_id);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_clubs_status ON clubs(status);
CREATE INDEX IF NOT EXISTS idx_slots_overlap ON booking_slots(court_id, date, start_time, end_time);

-- ====================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================================
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE minitours ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Công khai cho mọi người đọc sân, CLB active, Minitour, Bảng giá
CREATE POLICY "Public courts read" ON courts FOR SELECT USING (true);
CREATE POLICY "Public clubs read" ON clubs FOR SELECT USING (true);
CREATE POLICY "Public minitours read" ON minitours FOR SELECT USING (true);
CREATE POLICY "Public pricing read" ON pricing_rules FOR SELECT USING (true);
CREATE POLICY "Public court blocks read" ON court_blocks FOR SELECT USING (true);
CREATE POLICY "Public bookings read" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public bookings insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public bookings update" ON bookings FOR UPDATE USING (true);

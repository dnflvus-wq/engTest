-- 마이그레이션 스크립트 v5
-- 교재 목차 및 회차-챕터 연결 기능 추가

-- 교재 목차 테이블
CREATE TABLE IF NOT EXISTS book_chapters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    book_title VARCHAR(100) NOT NULL,
    part_number INT NOT NULL,
    part_title VARCHAR(100) NOT NULL,
    chapter_number INT NOT NULL,
    chapter_label VARCHAR(50) NOT NULL,
    chapter_title VARCHAR(200),
    seq_no INT NOT NULL,
    UNIQUE KEY uk_book_chapter (book_id, part_number, chapter_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 회차-챕터 연결 테이블
CREATE TABLE IF NOT EXISTS round_chapters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    round_id BIGINT NOT NULL,
    chapter_id BIGINT NOT NULL,
    FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES book_chapters(id) ON DELETE CASCADE,
    UNIQUE KEY uk_round_chapter (round_id, chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX IF NOT EXISTS idx_round_chapters_round ON round_chapters(round_id);
CREATE INDEX IF NOT EXISTS idx_round_chapters_chapter ON round_chapters(chapter_id);

-- ============================================
-- Book 1: 쉬운단어로 1분 영어 말하기 (83 Units)
-- ============================================

-- Part 1 (18 Units)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 1, 'Unit 01', 'get 나에게 생긴 모든 것을 말하기', 1),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 2, 'Unit 02', 'have 내가 가진 모든 것을 말하기', 2),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 3, 'Unit 03', 'take 내가 지금 가지려고 하는 모든 것을 말하기', 3),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 4, 'Unit 04', 'do 내가 매일 하는 것을 말하기', 4),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 5, 'Unit 05', 'make 어쩌다 한 번 만들어 내는 일을 말하기', 5),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 6, 'Unit 06', 'go 돌아다니는 일을 말하기', 6),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 7, 'Unit 07', 'be 가만히 있는 그 주어를 묘사하기', 7),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 8, 'Unit 08', '현재/be+-ing/be going to 다양한 시제로 말하기', 8),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 9, 'Unit 09', '과거/have p.p. 다양한 시제로 말하기', 9),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 10, 'Unit 10', 'have to/have been -ing 다양한 시제로 말하기', 10),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 11, 'Unit 11', 'must/will/would/should 다양한 어조로 말하기', 11),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 12, 'Unit 12', 'can/could/may/might 다양한 어조로 말하기', 12),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 13, 'Unit 13', 'not 안 한다고 말하기', 13),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 14, 'Unit 14', 'Do you~? 뭐 하는지 물어보기', 14),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 15, 'Unit 15', 'Am I~? 어떤 상태인지 물어보기', 15),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 16, 'Unit 16', 'Have you p.p.~? 해 본 적 있는지 물어보기', 16),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 17, 'Unit 17', 'Will you~? 조언을 구하거나 가능한지 물어보기', 17),
(1, '쉬운단어로 1분 영어 말하기', 1, 'Part 1', 18, 'Unit 18', 'Who/What/Which~? 누가 무엇이 그랬는지 물어보기', 18);

-- Part 2 (40 Units)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 1, 'Unit 01', 'that/who/what/which 두 문장 붙여 길게 말하기', 19),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 2, 'Unit 02', 'when/where/how/why 두 문장 붙여 길게 말하기', 20),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 3, 'Unit 03', 'if/whether 두 문장 붙여 길게 말하기', 21),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 4, 'Unit 04', 'and/but/or 두 문장 붙여 길게 말하기', 22),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 5, 'Unit 05', 'who/which/that 단어에 붙여 길게 말하기', 23),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 6, 'Unit 06', 'what 단어에 붙여 길게 말하기', 24),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 7, 'Unit 07', 'where/when/why/how 단어에 붙여 길게 말하기', 25),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 8, 'Unit 08', 'before/after/while/when 접속사로 붙여 길게 말하기', 26),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 9, 'Unit 09', 'as/because/so/since 접속사로 붙여 길게 말하기', 27),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 10, 'Unit 10', 'although/even though/though 접속사로 붙여 길게 말하기', 28),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 11, 'Unit 11', 'if/as long as/if only 접속사로 붙여 길게 말하기', 29),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 12, 'Unit 12', 'unless/what if/I wish 접속사로 붙여 길게 말하기', 30),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 13, 'Unit 13', 'like/as if/as though/even if 접속사로 붙여 길게 말하기', 31),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 14, 'Unit 14', 'want/plan/decide/need to를 이용해 동사 말하기', 32),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 15, 'Unit 15', 'would like to to를 이용해 동사 말하기', 33),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 16, 'Unit 16', 'I want you to to를 이용해 동사 말하기', 34),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 17, 'Unit 17', 'make/let/have/help to를 이용해 동사 말하기', 35),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 18, 'Unit 18', 'enjoy/keep/finish/mind -ing를 이용해 동사 말하기', 36),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 19, 'Unit 19', 'start/begin/continue -ing를 이용해 동사 말하기', 37),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 20, 'Unit 20', 'remember/regret/forget/try -ing를 이용해 동사 말하기', 38),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 21, 'Unit 21', 'see -ing/hear -ing -ing를 이용해 동사 말하기', 39),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 22, 'Unit 22', '-ing -ing를 이용해 동사 말하기', 40),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 23, 'Unit 23', 'be p.p. p.p.를 이용해 동사 말하기', 41),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 24, 'Unit 24', 'a/an/-s/X 디테일도 지켜 말하기', 42),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 25, 'Unit 25', 'the/this/that/my/X 디테일도 지켜 말하기', 43),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 26, 'Unit 26', 'some/any 디테일도 지켜 말하기', 44),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 27, 'Unit 27', 'all/most/both/none 디테일도 지켜 말하기', 45),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 28, 'Unit 28', 'a few/a little/many/a lot of 디테일도 지켜 말하기', 46),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 29, 'Unit 29', 'at/on/in/of 전치사를 이용해 디테일하게 말하기', 47),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 30, 'Unit 30', 'off/about/for/during 전치사를 이용해 디테일하게 말하기', 48),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 31, 'Unit 31', 'across/around/along/through 전치사를 이용해 디테일하게 말하기', 49),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 32, 'Unit 32', 'by/until/before/after 전치사를 이용해 디테일하게 말하기', 50),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 33, 'Unit 33', 'behind/under/to/into 전치사를 이용해 디테일하게 말하기', 51),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 34, 'Unit 34', 'up/down 전치사를 이용해 디테일하게 말하기', 52),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 35, 'Unit 35', 'very/so/enough/too 부사를 이용해 디테일하게 말하기', 53),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 36, 'Unit 36', 'always/usually/often/sometimes 부사를 이용해 디테일하게 말하기', 54),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 37, 'Unit 37', 'never/already/still/yet 부사를 이용해 디테일하게 말하기', 55),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 38, 'Unit 38', 'just/even/ever/anymore 부사를 이용해 디테일하게 말하기', 56),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 39, 'Unit 39', '-ever 부사를 이용해 디테일하게 말하기', 57),
(1, '쉬운단어로 1분 영어 말하기', 2, 'Part 2', 40, 'Unit 40', 'too/as well/also/either 부사를 이용해 디테일하게 말하기', 58);

-- Part 3 (25 Units)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 1, 'Unit 01', '간단한 자기소개', 59),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 2, 'Unit 02', '내 직업', 60),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 3, 'Unit 03', '내 성향', 61),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 4, 'Unit 04', '우리 가족', 62),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 5, 'Unit 05', '어제 있었던 일', 63),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 6, 'Unit 06', '지난 주말에 있었던 일', 64),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 7, 'Unit 07', '지금 하고 있는 일', 65),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 8, 'Unit 08', '내일 할 일', 66),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 9, 'Unit 09', '이번 주말에 할 일', 67),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 10, 'Unit 10', '다음 휴가 때 하고 싶은 일', 68),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 11, 'Unit 11', '좋아하는 영화, TV 프로그램', 69),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 12, 'Unit 12', '좋아하는 음악, 가수', 70),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 13, 'Unit 13', '좋아하는 책, 작가', 71),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 14, 'Unit 14', '좋아하는 패션 스타일', 72),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 15, 'Unit 15', '좋아하는 음식이나 맛집', 73),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 16, 'Unit 16', '친한 친구나 지인', 74),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 17, 'Unit 17', '가장 기억나는 여행지', 75),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 18, 'Unit 18', '돈 모아서 꼭 사고 싶은 것', 76),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 19, 'Unit 19', '태어나서 가장 잘한 일', 77),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 20, 'Unit 20', '잊히지 않는 추억', 78),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 21, 'Unit 21', '최근 힘들었던 일', 79),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 22, 'Unit 22', '최근 가장 고민하는 일', 80),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 23, 'Unit 23', '나를 힘들게 하는 사람', 81),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 24, 'Unit 24', '올해 꼭 이루고 싶은 것', 82),
(1, '쉬운단어로 1분 영어 말하기', 3, 'Part 3', 25, 'Unit 25', '평생 꼭 이루고 싶은 것', 83);

-- ============================================
-- Book 2: 영어 프리토킹 100일의 기적 with AI (100 Days)
-- ============================================

-- Part 1: 일상 (Day 001-010)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(2, '영어 프리토킹 100일의 기적 with AI', 1, '일상', 1, 'Day 001', '나에 대해 About Me', 1),
(2, '영어 프리토킹 100일의 기적 with AI', 1, '일상', 2, 'Day 002', '하루 루틴 Daily Routine', 2),
(2, '영어 프리토킹 100일의 기적 with AI', 1, '일상', 3, 'Day 003', '내가 하는 일 My Work', 3),
(2, '영어 프리토킹 100일의 기적 with AI', 1, '일상', 4, 'Day 004', '가족 소개 My Family', 4),
(2, '영어 프리토킹 100일의 기적 with AI', 1, '일상', 5, 'Day 005', '집안일 담당 Housework', 5),
(2, '영어 프리토킹 100일의 기적 with AI', 1, '일상', 6, 'Day 006', '친구 관계 Friendship', 6),
(2, '영어 프리토킹 100일의 기적 with AI', 1, '일상', 7, 'Day 007', '날씨 이야기 Weather Talk', 7),
(2, '영어 프리토킹 100일의 기적 with AI', 1, '일상', 8, 'Day 008', '오늘 있었던 일 Sharing My Day', 8),
(2, '영어 프리토킹 100일의 기적 with AI', 1, '일상', 9, 'Day 009', '주말 계획 Weekend Plans', 9),
(2, '영어 프리토킹 100일의 기적 with AI', 1, '일상', 10, 'Day 010', '이동 수단 Getting Around', 10);

-- Part 2: 취향과 관심사 (Day 011-020)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(2, '영어 프리토킹 100일의 기적 with AI', 2, '취향과 관심사', 11, 'Day 011', '요리 스킬 Cooking Skills', 11),
(2, '영어 프리토킹 100일의 기적 with AI', 2, '취향과 관심사', 12, 'Day 012', '맛집 탐방 Food Adventures', 12),
(2, '영어 프리토킹 100일의 기적 with AI', 2, '취향과 관심사', 13, 'Day 013', '영화와 미드 Movies and TV Shows', 13),
(2, '영어 프리토킹 100일의 기적 with AI', 2, '취향과 관심사', 14, 'Day 014', '커피와 음료 Coffee and Drinks', 14),
(2, '영어 프리토킹 100일의 기적 with AI', 2, '취향과 관심사', 15, 'Day 015', '좋아하는 공연 Favorite Performances', 15),
(2, '영어 프리토킹 100일의 기적 with AI', 2, '취향과 관심사', 16, 'Day 016', '음악 감상 Listening to Music', 16),
(2, '영어 프리토킹 100일의 기적 with AI', 2, '취향과 관심사', 17, 'Day 017', '패션 취향 Fashion Taste', 17),
(2, '영어 프리토킹 100일의 기적 with AI', 2, '취향과 관심사', 18, 'Day 018', '쇼핑 습관 Shopping Habits', 18),
(2, '영어 프리토킹 100일의 기적 with AI', 2, '취향과 관심사', 19, 'Day 019', '집 꾸미기 Home Deco', 19),
(2, '영어 프리토킹 100일의 기적 with AI', 2, '취향과 관심사', 20, 'Day 020', '반려 동물 키우기 Pet Care', 20);

-- Part 3: 취미와 여가 (Day 021-030)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(2, '영어 프리토킹 100일의 기적 with AI', 3, '취미와 여가', 21, 'Day 021', '여행 이야기 Travel Stories', 21),
(2, '영어 프리토킹 100일의 기적 with AI', 3, '취미와 여가', 22, 'Day 022', 'OTT 서비스 Streaming Platforms', 22),
(2, '영어 프리토킹 100일의 기적 with AI', 3, '취미와 여가', 23, 'Day 023', '라이브 콘서트 Live Concerts', 23),
(2, '영어 프리토킹 100일의 기적 with AI', 3, '취미와 여가', 24, 'Day 024', '게임 즐기기 Enjoying Games', 24),
(2, '영어 프리토킹 100일의 기적 with AI', 3, '취미와 여가', 25, 'Day 025', '전시 나들이 Exhibition Visits', 25),
(2, '영어 프리토킹 100일의 기적 with AI', 3, '취미와 여가', 26, 'Day 026', '책 읽기 Reading Books', 26),
(2, '영어 프리토킹 100일의 기적 with AI', 3, '취미와 여가', 27, 'Day 027', '글쓰기의 즐거움 The Joy of Writing', 27),
(2, '영어 프리토킹 100일의 기적 with AI', 3, '취미와 여가', 28, 'Day 028', '캠핑 경험 Camping Experience', 28),
(2, '영어 프리토킹 100일의 기적 with AI', 3, '취미와 여가', 29, 'Day 029', '스포츠 경기 관람 Watching Sports', 29),
(2, '영어 프리토킹 100일의 기적 with AI', 3, '취미와 여가', 30, 'Day 030', '특별한 취미 Special Hobby', 30);

-- Part 4: 일과 학업 (Day 031-040)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(2, '영어 프리토킹 100일의 기적 with AI', 4, '일과 학업', 31, 'Day 031', '직장 생활 Life at Work', 31),
(2, '영어 프리토킹 100일의 기적 with AI', 4, '일과 학업', 32, 'Day 032', '워라밸 Work-Life Balance', 32),
(2, '영어 프리토킹 100일의 기적 with AI', 4, '일과 학업', 33, 'Day 033', '출퇴근 Commuting', 33),
(2, '영어 프리토킹 100일의 기적 with AI', 4, '일과 학업', 34, 'Day 034', '직장 고민 Workplace Dilemma', 34),
(2, '영어 프리토킹 100일의 기적 with AI', 4, '일과 학업', 35, 'Day 035', '이직 준비 Job Transition', 35),
(2, '영어 프리토킹 100일의 기적 with AI', 4, '일과 학업', 36, 'Day 036', '시간 관리 Time Management', 36),
(2, '영어 프리토킹 100일의 기적 with AI', 4, '일과 학업', 37, 'Day 037', '창업 아이디어 Business Ideas', 37),
(2, '영어 프리토킹 100일의 기적 with AI', 4, '일과 학업', 38, 'Day 038', '자기 계발 Self-Improvement', 38),
(2, '영어 프리토킹 100일의 기적 with AI', 4, '일과 학업', 39, 'Day 039', '외국어 공부 Language Learning', 39),
(2, '영어 프리토킹 100일의 기적 with AI', 4, '일과 학업', 40, 'Day 040', '고학력 도전 Academic Goals', 40);

-- Part 5: 건강과 웰빙 (Day 041-050)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(2, '영어 프리토킹 100일의 기적 with AI', 5, '건강과 웰빙', 41, 'Day 041', '건강 관리 팁 Health Tips', 41),
(2, '영어 프리토킹 100일의 기적 with AI', 5, '건강과 웰빙', 42, 'Day 042', '규칙적인 운동 Regular Exercise', 42),
(2, '영어 프리토킹 100일의 기적 with AI', 5, '건강과 웰빙', 43, 'Day 043', '기분과 감정 Mood and Emotions', 43),
(2, '영어 프리토킹 100일의 기적 with AI', 5, '건강과 웰빙', 44, 'Day 044', '스트레스 해소 Stress Relief', 44),
(2, '영어 프리토킹 100일의 기적 with AI', 5, '건강과 웰빙', 45, 'Day 045', '다이어트 목표 Diet Goals', 45),
(2, '영어 프리토킹 100일의 기적 with AI', 5, '건강과 웰빙', 46, 'Day 046', '영양제 섭취 Taking Supplements', 46),
(2, '영어 프리토킹 100일의 기적 with AI', 5, '건강과 웰빙', 47, 'Day 047', '충분한 휴식 Getting Enough Rest', 47),
(2, '영어 프리토킹 100일의 기적 with AI', 5, '건강과 웰빙', 48, 'Day 048', '숙면 취하기 Quality Sleep', 48),
(2, '영어 프리토킹 100일의 기적 with AI', 5, '건강과 웰빙', 49, 'Day 049', '건강검진 Health Check-ups', 49),
(2, '영어 프리토킹 100일의 기적 with AI', 5, '건강과 웰빙', 50, 'Day 050', '가족의 건강 Family Health', 50);

-- Part 6: 인간관계 (Day 051-060)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(2, '영어 프리토킹 100일의 기적 with AI', 6, '인간관계', 51, 'Day 051', '연애와 결혼 Dating and Marriage', 51),
(2, '영어 프리토킹 100일의 기적 with AI', 6, '인간관계', 52, 'Day 052', '아이와 육아 Parenting and Kids', 52),
(2, '영어 프리토킹 100일의 기적 with AI', 6, '인간관계', 53, 'Day 053', '친구와의 추억 Memories with Friends', 53),
(2, '영어 프리토킹 100일의 기적 with AI', 6, '인간관계', 54, 'Day 054', '부모님 건강 Parents Health', 54),
(2, '영어 프리토킹 100일의 기적 with AI', 6, '인간관계', 55, 'Day 055', '형제자매 근황 Sibling Updates', 55),
(2, '영어 프리토킹 100일의 기적 with AI', 6, '인간관계', 56, 'Day 056', '친척 모임 Relatives Gathering', 56),
(2, '영어 프리토킹 100일의 기적 with AI', 6, '인간관계', 57, 'Day 057', '나의 오랜 친구들 My Oldest Friends', 57),
(2, '영어 프리토킹 100일의 기적 with AI', 6, '인간관계', 58, 'Day 058', '성격 유형 Personality Types', 58),
(2, '영어 프리토킹 100일의 기적 with AI', 6, '인간관계', 59, 'Day 059', '갈등 해결 방법 Conflict Resolution', 59),
(2, '영어 프리토킹 100일의 기적 with AI', 6, '인간관계', 60, 'Day 060', '인간관계 피로 Relationship Burnout', 60);

-- Part 7: 트렌드 (Day 061-070)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(2, '영어 프리토킹 100일의 기적 with AI', 7, '트렌드', 61, 'Day 061', '뷰티 트렌드 Beauty Trends', 61),
(2, '영어 프리토킹 100일의 기적 with AI', 7, '트렌드', 62, 'Day 062', '배달 문화 Delivery Culture', 62),
(2, '영어 프리토킹 100일의 기적 with AI', 7, '트렌드', 63, 'Day 063', '스마트폰 Smartphones', 63),
(2, '영어 프리토킹 100일의 기적 with AI', 7, '트렌드', 64, 'Day 064', '콘텐츠 시청 Viewing Content', 64),
(2, '영어 프리토킹 100일의 기적 with AI', 7, '트렌드', 65, 'Day 065', '소셜 미디어 Social Media', 65),
(2, '영어 프리토킹 100일의 기적 with AI', 7, '트렌드', 66, 'Day 066', '케이팝 K-pop', 66),
(2, '영어 프리토킹 100일의 기적 with AI', 7, '트렌드', 67, 'Day 067', '한국 드라마 K-drama', 67),
(2, '영어 프리토킹 100일의 기적 with AI', 7, '트렌드', 68, 'Day 068', '한국 음식 K-food', 68),
(2, '영어 프리토킹 100일의 기적 with AI', 7, '트렌드', 69, 'Day 069', '라이프 스타일 Lifestyle', 69),
(2, '영어 프리토킹 100일의 기적 with AI', 7, '트렌드', 70, 'Day 070', '소비 성향 Spending Habits', 70);

-- Part 8: 가치관 (Day 071-080)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(2, '영어 프리토킹 100일의 기적 with AI', 8, '가치관', 71, 'Day 071', '행복 Happiness', 71),
(2, '영어 프리토킹 100일의 기적 with AI', 8, '가치관', 72, 'Day 072', '성공의 기준 The Standard of Success', 72),
(2, '영어 프리토킹 100일의 기적 with AI', 8, '가치관', 73, 'Day 073', '돈과 삶의 관계 Money and Life', 73),
(2, '영어 프리토킹 100일의 기적 with AI', 8, '가치관', 74, 'Day 074', '삶의 우선순위 Life Priorities', 74),
(2, '영어 프리토킹 100일의 기적 with AI', 8, '가치관', 75, 'Day 075', '자존감 Self-Esteem', 75),
(2, '영어 프리토킹 100일의 기적 with AI', 8, '가치관', 76, 'Day 076', '경쟁과 협력 Competition and Cooperation', 76),
(2, '영어 프리토킹 100일의 기적 with AI', 8, '가치관', 77, 'Day 077', '도전과 실패 Challenges and Failures', 77),
(2, '영어 프리토킹 100일의 기적 with AI', 8, '가치관', 78, 'Day 078', '이상과 현실 Ideals and Reality', 78),
(2, '영어 프리토킹 100일의 기적 with AI', 8, '가치관', 79, 'Day 079', '성장과 안주 Growth and Comfort', 79),
(2, '영어 프리토킹 100일의 기적 with AI', 8, '가치관', 80, 'Day 080', '인생의 의미 The Meaning of Life', 80);

-- Part 9: 사회적 이슈 (Day 081-090)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(2, '영어 프리토킹 100일의 기적 with AI', 9, '사회적 이슈', 81, 'Day 081', '기술 격차 Digital Divide', 81),
(2, '영어 프리토킹 100일의 기적 with AI', 9, '사회적 이슈', 82, 'Day 082', '가짜 뉴스 Fake News', 82),
(2, '영어 프리토킹 100일의 기적 with AI', 9, '사회적 이슈', 83, 'Day 083', '정치에 대한 관심 Interest in Politics', 83),
(2, '영어 프리토킹 100일의 기적 with AI', 9, '사회적 이슈', 84, 'Day 084', '물가 상승 Rising Costs', 84),
(2, '영어 프리토킹 100일의 기적 with AI', 9, '사회적 이슈', 85, 'Day 085', '환경 오염 Environmental Pollution', 85),
(2, '영어 프리토킹 100일의 기적 with AI', 9, '사회적 이슈', 86, 'Day 086', '타인과의 비교 Me vs. Others', 86),
(2, '영어 프리토킹 100일의 기적 with AI', 9, '사회적 이슈', 87, 'Day 087', '인공지능 시대 Artificial Intelligence', 87),
(2, '영어 프리토킹 100일의 기적 with AI', 9, '사회적 이슈', 88, 'Day 088', '저출산 Low Birth Rate', 88),
(2, '영어 프리토킹 100일의 기적 with AI', 9, '사회적 이슈', 89, 'Day 089', '일자리 대체 Job Replacement', 89),
(2, '영어 프리토킹 100일의 기적 with AI', 9, '사회적 이슈', 90, 'Day 090', '100세 시대 Living to 100', 90);

-- Part 10: 미래 계획 (Day 091-100)
INSERT INTO book_chapters (book_id, book_title, part_number, part_title, chapter_number, chapter_label, chapter_title, seq_no) VALUES
(2, '영어 프리토킹 100일의 기적 with AI', 10, '미래 계획', 91, 'Day 091', '자아 실현 Personal Fulfillment', 91),
(2, '영어 프리토킹 100일의 기적 with AI', 10, '미래 계획', 92, 'Day 092', '재테크 Investment', 92),
(2, '영어 프리토킹 100일의 기적 with AI', 10, '미래 계획', 93, 'Day 093', '파이어족 Early Retirement Goals', 93),
(2, '영어 프리토킹 100일의 기적 with AI', 10, '미래 계획', 94, 'Day 094', '살고 싶은 집 Dream House', 94),
(2, '영어 프리토킹 100일의 기적 with AI', 10, '미래 계획', 95, 'Day 095', '경제적 자유 Financial Freedom', 95),
(2, '영어 프리토킹 100일의 기적 with AI', 10, '미래 계획', 96, 'Day 096', '어릴 적 꿈 Childhood Dreams', 96),
(2, '영어 프리토킹 100일의 기적 with AI', 10, '미래 계획', 97, 'Day 097', '현재의 꿈 Current Goals', 97),
(2, '영어 프리토킹 100일의 기적 with AI', 10, '미래 계획', 98, 'Day 098', '버킷리스트 Bucket List', 98),
(2, '영어 프리토킹 100일의 기적 with AI', 10, '미래 계획', 99, 'Day 099', '5년 후 In Five Years', 99),
(2, '영어 프리토킹 100일의 기적 with AI', 10, '미래 계획', 100, 'Day 100', '10년 후 In Ten Years', 100);

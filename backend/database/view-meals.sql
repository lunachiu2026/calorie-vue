-- 在 phpMyAdmin 選擇 calorie_db 後，於 SQL 分頁執行。
SELECT u.username AS 帳號, r.meal_date AS 飲食日期,
       i.meal_type AS 餐別, i.food_name AS 食物,
       i.weight_g AS 重量克, i.calories AS 熱量,
       i.protein_g AS 蛋白質克, i.fat_g AS 脂肪克, i.carbs_g AS 碳水克
FROM meal_records r
JOIN users u ON u.id = r.user_id
JOIN meal_items i ON i.record_id = r.id
ORDER BY r.meal_date DESC, u.username, i.id;

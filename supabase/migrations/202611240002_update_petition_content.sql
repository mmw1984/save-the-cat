-- Replace the seeded petition copy with the new text (two kittens, Friday
-- removal deadline, demand for transparency and a Student Forum discussion),
-- retitle to "Save the Cat" and drop the signature goal.
update petition_content
set title = 'Save the Cat',
    body = '兩隻貓B喺我哋校園住咗一個月，一直俾學生同老師疼錫照顧，我哋好想佢哋留低。而家傳出消息話，佢哋會喺今個星期五被移走，校方冇任何正式解釋或者諮詢。

一間 Band 1 學校理應實踐基本嘅透明度，同埋建立真正嘅「生命教育」，可惜呢個決定將兩者完全拋棄。我相信動物唔係有需要先攞出嚟展示、冇需要就靜靜雞拋棄嘅道具。

喺任何倉促而且不可逆轉嘅決定落實之前，我要求校長暫停呢次移走行動，公開同學生討論，例如透過十二月初嘅學生論壇。作為學校社群嘅一員同埋寵物嘅共同主人，我認為我哋值得一個合理嘅解釋，同埋真正嘅發言權。',
    goal_count = 0,
    updated_at = now()
where id = true
  -- Only replace the original seed text; never clobber an operator edit.
  and body = '我哋係中華基督教會何福堂書院嘅學生。學校打算移除照顧咗五年嘅校貓「阿福」，我哋希望校方重新考慮，等阿福可以繼續留喺校園。

如果你都想阿福留低，請用學校 Google 帳號喺下面簽名支持。';

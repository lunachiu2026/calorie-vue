from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)

OUTPUT = r"C:\food-20260819\calorie-vue\output\pdf\GitHub協作操作指南.pdf"

SAGE = colors.HexColor("#AAC0AF")
SAGE_DARK = colors.HexColor("#667A6B")
SAGE_LIGHT = colors.HexColor("#EFF4F0")
PINK = colors.HexColor("#FAAC9A")
PINK_LIGHT = colors.HexColor("#FFF0EC")
INK = colors.HexColor("#26332B")
MUTED = colors.HexColor("#68756D")
LINE = colors.HexColor("#DCE5DE")
WHITE = colors.white

pdfmetrics.registerFont(TTFont("MSJH", r"C:\Windows\Fonts\msjh.ttc"))
pdfmetrics.registerFont(TTFont("MSJH-Bold", r"C:\Windows\Fonts\msjhbd.ttc"))

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="ZhTitle", fontName="MSJH-Bold", fontSize=28, leading=38,
    textColor=INK, alignment=TA_CENTER, spaceAfter=12,
))
styles.add(ParagraphStyle(
    name="ZhSubtitle", fontName="MSJH", fontSize=12, leading=20,
    textColor=MUTED, alignment=TA_CENTER,
))
styles.add(ParagraphStyle(
    name="ZhH1", fontName="MSJH-Bold", fontSize=19, leading=26,
    textColor=INK, spaceBefore=2, spaceAfter=11,
))
styles.add(ParagraphStyle(
    name="ZhH2", fontName="MSJH-Bold", fontSize=13.5, leading=20,
    textColor=SAGE_DARK, spaceBefore=8, spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="ZhBody", fontName="MSJH", fontSize=10.5, leading=18,
    textColor=INK, spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="ZhSmall", fontName="MSJH", fontSize=8.5, leading=14,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="ZhStep", fontName="MSJH", fontSize=10.5, leading=18,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="ZhStepNo", fontName="MSJH-Bold", fontSize=13, leading=16,
    textColor=WHITE, alignment=TA_CENTER,
))
styles.add(ParagraphStyle(
    name="ZhCodeLabel", fontName="MSJH-Bold", fontSize=9, leading=13,
    textColor=SAGE_DARK, spaceAfter=4,
))

code_style = ParagraphStyle(
    name="Code", fontName="MSJH", fontSize=8.8, leading=14,
    textColor=colors.HexColor("#233129"), leftIndent=0, rightIndent=0,
)


def header_footer(canvas, doc):
    canvas.saveState()
    page = canvas.getPageNumber()
    if page > 1:
        canvas.setFont("MSJH-Bold", 8.5)
        canvas.setFillColor(SAGE_DARK)
        canvas.drawString(18 * mm, A4[1] - 13 * mm, "calorie-vue | GitHub 協作操作指南")
        canvas.setStrokeColor(LINE)
        canvas.line(18 * mm, A4[1] - 16 * mm, A4[0] - 18 * mm, A4[1] - 16 * mm)
    canvas.setFont("MSJH", 8)
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(A4[0] / 2, 11 * mm, f"第 {page} 頁")
    canvas.restoreState()


def step(number, title, body):
    number_cell = Table(
        [[Paragraph(str(number), styles["ZhStepNo"])]] ,
        colWidths=[9 * mm], rowHeights=[9 * mm],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), SAGE),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOX", (0, 0), (-1, -1), 0, SAGE),
        ]),
    )
    content = Paragraph(f"<b>{title}</b><br/>{body}", styles["ZhStep"])
    table = Table([[number_cell, content]], colWidths=[13 * mm, 150 * mm])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (0, 0), 4 * mm),
        ("RIGHTPADDING", (1, 0), (1, 0), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return table


def code_block(label, code):
    inner = [
        Paragraph(label, styles["ZhCodeLabel"]),
        Preformatted(code, code_style),
    ]
    table = Table([[inner]], colWidths=[163 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F5F7F5")),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return table


def callout(title, text, color=SAGE_LIGHT, border=SAGE):
    table = Table([[
        Paragraph(f"<b>{title}</b><br/>{text}", styles["ZhBody"])
    ]], colWidths=[163 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("LINEBEFORE", (0, 0), (0, -1), 4, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return table


doc = BaseDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=18 * mm,
    leftMargin=18 * mm,
    topMargin=22 * mm,
    bottomMargin=18 * mm,
    title="GitHub 協作操作指南",
    author="calorie-vue 專案",
    subject="邀請協作者、使用分支、提交程式與 Pull Request",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
doc.addPageTemplates([PageTemplate(id="guide", frames=[frame], onPage=header_footer)])

story = []

# Cover
story += [
    Spacer(1, 32 * mm),
    Table([["GITHUB TEAMWORK"]], colWidths=[70 * mm], rowHeights=[10 * mm],
          style=TableStyle([
              ("BACKGROUND", (0, 0), (-1, -1), SAGE),
              ("TEXTCOLOR", (0, 0), (-1, -1), WHITE),
              ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
              ("FONTSIZE", (0, 0), (-1, -1), 9),
              ("ALIGN", (0, 0), (-1, -1), "CENTER"),
              ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
          ]),
    hAlign="CENTER"),
    Spacer(1, 12 * mm),
    Paragraph("GitHub 協作操作指南", styles["ZhTitle"]),
    Paragraph("兩位同學共同開發 calorie-vue 專案", styles["ZhSubtitle"]),
    Spacer(1, 16 * mm),
    callout(
        "推薦工作方式",
        "加入 Collaborator + 每人使用自己的功能分支 + Pull Request 審查後合併。這樣可以同時開發，又能降低互相覆蓋程式碼的風險。",
    ),
    Spacer(1, 12 * mm),
    Table([
        [Paragraph("專案網址", styles["ZhSmall"]), Paragraph("https://github.com/lunachiu2026/calorie-vue", styles["ZhBody"])],
        [Paragraph("主要分支", styles["ZhSmall"]), Paragraph("main", styles["ZhBody"])],
        [Paragraph("使用技術", styles["ZhSmall"]), Paragraph("Vue 3 + Vite + GitHub Pages", styles["ZhBody"])],
    ], colWidths=[35 * mm, 128 * mm], style=TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
        ("BACKGROUND", (0, 0), (0, -1), PINK_LIGHT),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ])),
    Spacer(1, 19 * mm),
    Paragraph("快速流程", styles["ZhH2"]),
    Paragraph("邀請同學 -> Clone 專案 -> 建立分支 -> 修改與測試 -> Commit -> Push -> Pull Request -> Merge", styles["ZhBody"]),
    PageBreak(),
]

# Page 2
story += [
    Paragraph("一、專案擁有者：邀請同學", styles["ZhH1"]),
    step(1, "打開 GitHub 專案", "前往 calorie-vue Repository，確認自己已登入專案擁有者帳號。"),
    step(2, "進入權限設定", "點選 Settings，在左側 Access 區域選擇 Collaborators。"),
    step(3, "新增協作者", "點選 Add people，輸入同學的 GitHub 使用者名稱或 Email。"),
    step(4, "接受邀請", "同學必須從 GitHub 通知或 Email 接受邀請，接受後才可以 Push 程式碼。"),
    Spacer(1, 5 * mm),
    callout("權限提醒", "Collaborator 可以修改程式碼及建立 Pull Request。不要分享自己的 GitHub 密碼或存取權杖；每個人都使用自己的帳號。", PINK_LIGHT, PINK),
    Spacer(1, 8 * mm),
    Paragraph("二、同學第一次下載專案", styles["ZhH1"]),
    Paragraph("同學在自己的電腦開啟 Terminal、PowerShell 或 VS Code 終端機，依序執行：", styles["ZhBody"]),
    code_block("第一次 Clone", "git clone https://github.com/lunachiu2026/calorie-vue.git\ncd calorie-vue\nnpm install\nnpm run dev"),
    Spacer(1, 8 * mm),
    callout("正常結果", "執行 npm run dev 後，終端機會顯示本機網址。用瀏覽器開啟該網址即可確認專案是否正常。"),
    PageBreak(),
]

# Page 3
story += [
    Paragraph("三、每個人建立自己的功能分支", styles["ZhH1"]),
    Paragraph("不要兩個人都直接在 main 上開發。每個功能各自建立分支，完成後再合併。", styles["ZhBody"]),
    code_block("同學負責會員頁面", "git switch main\ngit pull origin main\ngit switch -c feature/member-page"),
    Spacer(1, 6 * mm),
    code_block("你負責首頁", "git switch main\ngit pull origin main\ngit switch -c feature/homepage"),
    Spacer(1, 8 * mm),
    callout("分支命名建議", "使用 feature/功能名稱，例如 feature/login、feature/booking、feature/mobile-menu。名稱使用英文、小寫及連字號，較容易辨識。"),
    Spacer(1, 10 * mm),
    Paragraph("四、修改完成後提交與上傳", styles["ZhH1"]),
    code_block("檢查、提交與 Push", "git status\ngit add .\ngit commit -m \"完成會員頁面\"\ngit push -u origin feature/member-page"),
    Spacer(1, 7 * mm),
    Paragraph("第一次 Push 使用 -u 建立遠端追蹤。之後同一分支再次上傳，只需要：", styles["ZhBody"]),
    code_block("同一分支後續上傳", "git add .\ngit commit -m \"調整會員頁面樣式\"\ngit push"),
    PageBreak(),
]

# Page 4
story += [
    Spacer(1, 8 * mm),
    Paragraph("五、建立 Pull Request 並合併", styles["ZhH1"]),
    step(1, "建立 Pull Request", "Push 後打開 GitHub，點選 Compare & pull request。"),
    step(2, "確認合併方向", "base 選 main，compare 選同學的功能分支，例如 feature/member-page。"),
    step(3, "寫清楚修改內容", "標題說明完成的功能，內容列出修改檔案、測試方式及仍需注意的事項。"),
    step(4, "檢查程式", "另一位同學檢查 Files changed，確認沒有刪除不相關程式，也確認 GitHub Actions 通過。"),
    step(5, "合併", "確認沒問題後按 Merge pull request。main 更新後，GitHub Pages 會依工作流程重新部署。"),
    Spacer(1, 7 * mm),
    Paragraph("Pull Request 說明範例", styles["ZhH2"]),
    code_block("可以直接參考", "Title: 完成會員登入頁面\n\nChanges:\n- 更新登入按鈕樣式\n- 新增登入錯誤提示\n- 完成手機版排版\n\nTest:\n- npm run build\n- 瀏覽器實際登入測試"),
    Spacer(1, 8 * mm),
    callout("合併前不要急", "Pull Request 是你們互相檢查程式的地方。確認畫面、功能及 npm run build 都正常後再 Merge。", PINK_LIGHT, PINK),
    PageBreak(),
]

# Page 5
story += [
    Paragraph("六、每天開始工作前先同步", styles["ZhH1"]),
    Paragraph("main 可能已經包含另一位同學的新功能，因此每天開始前先更新：", styles["ZhBody"]),
    code_block("更新 main", "git switch main\ngit pull origin main"),
    Spacer(1, 6 * mm),
    Paragraph("如果要建立新的功能分支，必須從最新的 main 建立：", styles["ZhBody"]),
    code_block("建立下一個功能分支", "git switch -c feature/new-feature"),
    Spacer(1, 10 * mm),
    Paragraph("七、遇到衝突怎麼辦", styles["ZhH1"]),
    Paragraph("如果兩個人修改同一個檔案的同一段程式，Git 可能顯示 CONFLICT。請先停止 Push，不要刪除整個檔案，也不要使用 git reset --hard。", styles["ZhBody"]),
    code_block("先把 main 合併進自己的分支", "git switch feature/member-page\ngit merge main"),
    Spacer(1, 6 * mm),
    Paragraph("VS Code 會標示 Current Change 與 Incoming Change。和同學確認要保留哪些內容，修改完成後再提交：", styles["ZhBody"]),
    code_block("解決衝突後", "git add .\ngit commit -m \"解決合併衝突\"\ngit push"),
    Spacer(1, 8 * mm),
    callout("避免衝突的方法", "先分配工作範圍；避免同時修改同一個 Vue 檔案；開始前先 git pull；小量多次 Commit；使用 Pull Request 檢查。"),
    PageBreak(),
]

# Page 6
story += [
    Paragraph("八、常用指令速查表", styles["ZhH1"]),
    Table([
        [Paragraph("目的", styles["ZhH2"]), Paragraph("指令", styles["ZhH2"])],
        [Paragraph("查看目前狀態", styles["ZhBody"]), Paragraph("git status", styles["ZhBody"])],
        [Paragraph("查看目前分支", styles["ZhBody"]), Paragraph("git branch", styles["ZhBody"])],
        [Paragraph("切換 main", styles["ZhBody"]), Paragraph("git switch main", styles["ZhBody"])],
        [Paragraph("取得最新版本", styles["ZhBody"]), Paragraph("git pull origin main", styles["ZhBody"])],
        [Paragraph("建立功能分支", styles["ZhBody"]), Paragraph("git switch -c feature/name", styles["ZhBody"])],
        [Paragraph("加入修改", styles["ZhBody"]), Paragraph("git add .", styles["ZhBody"])],
        [Paragraph("建立提交", styles["ZhBody"]), Paragraph('git commit -m "修改說明"', styles["ZhBody"])],
        [Paragraph("上傳分支", styles["ZhBody"]), Paragraph("git push -u origin feature/name", styles["ZhBody"])],
    ], colWidths=[50 * mm, 113 * mm], repeatRows=1, style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), SAGE),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, colors.HexColor("#F8FAF8")]),
    ])),
    Spacer(1, 10 * mm),
    Paragraph("合作檢查清單", styles["ZhH1"]),
    Paragraph("□ 同學已接受 Collaborator 邀請<br/>□ 每個人使用自己的分支<br/>□ 開始前已更新 main<br/>□ Commit 訊息清楚描述修改內容<br/>□ npm run build 測試成功<br/>□ Pull Request 已由另一位同學檢查<br/>□ 合併後 GitHub Actions 部署成功", styles["ZhBody"]),
    Spacer(1, 8 * mm),
    callout("記住這句話", "先 Pull、分支開發、小量 Commit、Pull Request 檢查、確認後 Merge。", PINK_LIGHT, PINK),
    Spacer(1, 10 * mm),
    Paragraph("官方參考資料", styles["ZhH2"]),
    Paragraph('<link href="https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository" color="#667A6B">GitHub Docs - Inviting collaborators to a personal repository</link>', styles["ZhSmall"]),
]

doc.build(story)
print(OUTPUT)

from http.server import BaseHTTPRequestHandler
import json, io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas

W, H = letter

def make_pdf(data: dict) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)

    def footer(cv, pg, total):
        cv.setFont("Helvetica", 7)
        cv.setFillColor(colors.black)
        cv.drawString(72, 20, "Form I-589 Edition 01/20/25")
        cv.drawString(72, 10, "DRAFT — For review only. Not an official USCIS document.")
        cv.drawRightString(W-72, 20, f"Page {pg} of {total}")

    def header(cv):
        cv.setFillColor(colors.black)
        cv.setFont("Helvetica-Bold", 13)
        cv.drawCentredString(W/2, H-52, "Application for Asylum and for Withholding of Removal")
        cv.setFont("Helvetica-Bold", 9)
        cv.drawCentredString(W/2, H-66, "Department of Homeland Security")
        cv.drawCentredString(W/2, H-78, "U.S. Citizenship and Immigration Services")
        cv.rect(W-140, H-92, 68, 58, stroke=1, fill=0)
        cv.setFont("Helvetica-Bold", 8)
        cv.drawString(W-134, H-38, "USCIS")
        cv.drawString(W-134, H-48, "Form I-589")
        cv.setFont("Helvetica", 7)
        cv.drawString(W-134, H-58, "OMB No. 1615-0067")
        cv.drawString(W-134, H-68, "Expires 09/30/2027")
        cv.saveState()
        cv.setFont("Helvetica-Bold", 40)
        cv.setFillColorRGB(0.88,0.88,0.88)
        cv.translate(W/2,H/2); cv.rotate(40)
        cv.drawCentredString(0,0,"DRAFT — REVIEW COPY")
        cv.restoreState()

    def sec_hdr(cv, y, title):
        cv.setFillColor(colors.black)
        cv.rect(72, y-2, W-144, 13, stroke=1, fill=1)
        cv.setFillColor(colors.white)
        cv.setFont("Helvetica-Bold", 9)
        cv.drawString(76, y+1, title)
        cv.setFillColor(colors.black)
        return y-18

    def box(cv, x, y, w, h, label, val, ls=7, vs=9):
        cv.rect(x, y, w, h, stroke=1, fill=0)
        cv.setFont("Helvetica", ls); cv.setFillColor(colors.black)
        cv.drawString(x+3, y+h-9, label[:60])
        if val:
            cv.setFont("Helvetica", vs)
            txt = str(val)
            while cv.stringWidth(txt,"Helvetica",vs) > w-8 and len(txt)>1: txt=txt[:-1]
            cv.drawString(x+3, y+4, txt)

    def ta(cv, x, y, w, h, label, val, ls=7):
        cv.rect(x, y, w, h, stroke=1, fill=0)
        cv.setFont("Helvetica", ls); cv.setFillColor(colors.black)
        cv.drawString(x+3, y+h-9, label[:80])
        if val:
            cv.setFont("Helvetica", 9)
            words=str(val).split(); line=""; lines=[]
            mc=int(w/5.2)
            for w2 in words:
                t=(line+" "+w2).strip()
                if len(t)<=mc: line=t
                else:
                    if line: lines.append(line)
                    line=w2
            if line: lines.append(line)
            ty=y+h-20; ml=int((h-18)/11)
            for ln in lines[:ml]: cv.drawString(x+3,ty,ln); ty-=11

    def chk(cv, x, y, label, checked=False, ls=8):
        cv.rect(x,y,8,8,stroke=1,fill=0)
        if checked: cv.setFont("Helvetica-Bold",7); cv.drawString(x+1,y+1,"X")
        cv.setFont("Helvetica",ls); cv.drawString(x+11,y+1,label[:50])

    def g(key): return data.get(key,"") or ""

    TOTAL = 7

    # PAGE 1 — Part A.I
    header(c); footer(c,1,TOTAL); y=H-100
    c.setFont("Helvetica-Bold",7); c.drawString(72,y,"START HERE — Type or print in black ink."); y-=10
    y=sec_hdr(c,y,"Part A.I.  Information About You")
    rh=30
    box(c,72,y-rh,148,rh,"1. A-Number (if any)",g("a_number"))
    box(c,220,y-rh,148,rh,"2. U.S. Social Security Number",g("ssn"))
    box(c,368,y-rh,172,rh,"3. USCIS Online Account Number",g("uscis_acct"))
    y-=rh+2
    box(c,72,y-rh,196,rh,"4. Complete Last Name",g("last_name"))
    box(c,268,y-rh,148,rh,"5. First Name",g("first_name"))
    box(c,416,y-rh,124,rh,"6. Middle Name",g("middle_name"))
    y-=rh+2
    box(c,72,y-rh,468,rh,"7. Other names used (maiden name and aliases)",g("aliases"))
    y-=rh+2
    box(c,72,y-rh,468,rh,"8. Residence in the U.S. — Street Number and Name",g("res_street"))
    y-=rh+2
    box(c,72,y-24,60,24,"Apt. Number",g("res_apt"))
    box(c,132,y-24,160,24,"City",g("res_city"))
    box(c,292,y-24,60,24,"State",g("res_state"))
    box(c,352,y-24,60,24,"Zip Code",g("res_zip"))
    box(c,412,y-24,128,24,"Telephone Number",g("res_phone"))
    y-=26
    box(c,72,y-24,200,24,"9. Mailing — In Care Of",g("mail_care_of"))
    box(c,272,y-24,268,24,"9. Mailing — Telephone Number",g("mail_phone"))
    y-=26
    box(c,72,y-24,340,24,"9. Mailing — Street Number and Name",g("mail_street"))
    box(c,412,y-24,128,24,"Apt. Number",g("mail_apt"))
    y-=26
    box(c,72,y-24,160,24,"9. Mailing — City",g("mail_city"))
    box(c,232,y-24,80,24,"State",g("mail_state"))
    box(c,312,y-24,80,24,"Zip Code",g("mail_zip"))
    y-=26
    sex=g("sex"); marital=g("marital")
    c.rect(72,y-26,468,26,stroke=1,fill=0)
    c.setFont("Helvetica",8); c.drawString(74,y-10,"10. Sex")
    chk(c,108,y-20,"Male",sex=="Male"); chk(c,148,y-20,"Female",sex=="Female")
    c.drawString(210,y-10,"11. Marital Status:")
    for i,opt in enumerate(["Single","Married","Divorced","Widowed"]):
        chk(c,290+i*46,y-20,opt,marital==opt)
    y-=28
    box(c,72,y-24,140,24,"12. Date of Birth (mm/dd/yyyy)",g("dob"))
    box(c,212,y-24,328,24,"13. City and Country of Birth",g("city_birth"))
    y-=26
    box(c,72,y-24,148,24,"14. Present Nationality (Citizenship)",g("nationality"))
    box(c,220,y-24,116,24,"15. Nationality at Birth",g("nat_birth"))
    box(c,336,y-24,116,24,"16. Race, Ethnic, or Tribal Group",g("race"))
    box(c,452,y-24,88,24,"17. Religion",g("religion"))
    y-=26
    court=g("imm_court")
    c.rect(72,y-36,468,36,stroke=1,fill=0)
    c.setFont("Helvetica",8); c.drawString(74,y-11,"18. Check the box that applies:")
    chk(c,74,y-26,"a. I have never been in Immigration Court proceedings.",court=="Never been in proceedings",8)
    chk(c,74,y-38,"b. I am now in Immigration Court proceedings.",court=="Currently in proceedings",8)
    chk(c,280,y-38,"c. I am NOT now but have been in the past.",court=="Not now, but have been before",8)
    y-=38
    box(c,72,y-24,200,24,"19a. When did you last leave your country?",g("last_left"))
    box(c,272,y-24,268,24,"19b. Current I-94 Number (if any)",g("i94"))
    y-=26
    # 3 entry rows
    for i,(dk,pk,sk,ek) in enumerate([("e1_date","e1_place","e1_status","e1_expires"),("e2_date","e2_place","e2_status",""),("e3_date","e3_place","e3_status","")]):
        box(c,72,y-20,80,20,f"19c. Entry {i+1} — Date",g(dk))
        box(c,152,y-20,140,20,f"Entry {i+1} — Place",g(pk))
        box(c,292,y-20,120,20,"Status",g(sk))
        if ek: box(c,412,y-20,128,20,"Date Status Expires",g(ek))
        y-=22
    box(c,72,y-24,176,24,"20. Country issued last passport",g("passport_ctry"))
    box(c,248,y-24,176,24,"21. Passport / Travel Document Number",g("passport_num"))
    box(c,424,y-24,116,24,"22. Expiration Date (mm/dd/yyyy)",g("passport_exp"))
    y-=26
    box(c,72,y-24,196,24,"23. Native language (include dialect)",g("native_lang"))
    fluent=g("fluent_en")
    c.rect(268,y-24,100,24,stroke=1,fill=0)
    c.setFont("Helvetica",7); c.drawString(270,y-9,"24. Fluent in English?")
    chk(c,270,y-20,"Yes",fluent=="Yes"); chk(c,306,y-20,"No",fluent=="No")
    box(c,368,y-24,172,24,"25. Other languages spoken fluently",g("other_langs"))

    # PAGE 2 — Part A.II Spouse
    c.showPage(); header(c); footer(c,2,TOTAL); y=H-100
    y=sec_hdr(c,"Part A.II.  Information About Your Spouse")
    not_married=g("not_married")
    c.rect(72,y-20,468,20,stroke=1,fill=0)
    chk(c,74,y-15,"I am not married (skip spouse section)",not_married=="Yes",8)
    y-=22
    box(c,72,y-28,148,28,"1. A-Number (if any)",g("sp_a_number"))
    box(c,220,y-28,148,28,"2. Passport/ID Card Number",g("sp_passport"))
    box(c,368,y-28,100,28,"3. Date of Birth (mm/dd/yyyy)",g("sp_dob"))
    box(c,468,y-28,72,28,"4. SSN (if any)",g("sp_ssn"))
    y-=30
    box(c,72,y-26,136,26,"5. Complete Last Name",g("sp_last"))
    box(c,208,y-26,120,26,"6. First Name",g("sp_first"))
    box(c,328,y-26,100,26,"7. Middle Name",g("sp_middle"))
    box(c,428,y-26,112,26,"8. Other names used",g("sp_aliases"))
    y-=28
    box(c,72,y-26,120,26,"9. Date of Marriage",g("sp_marriage_date"))
    box(c,192,y-26,156,26,"10. Place of Marriage",g("sp_marriage_place"))
    box(c,348,y-26,192,26,"11. City and Country of Birth",g("sp_birth_city"))
    y-=28
    box(c,72,y-26,156,26,"12. Nationality (Citizenship)",g("sp_nationality"))
    box(c,228,y-26,156,26,"13. Race, Ethnic, or Tribal Group",g("sp_race"))
    sp_sex=g("sp_sex")
    c.rect(384,y-26,80,26,stroke=1,fill=0)
    c.setFont("Helvetica",7); c.drawString(386,y-9,"14. Sex")
    chk(c,386,y-20,"M",sp_sex=="Male"); chk(c,410,y-20,"F",sp_sex=="Female")
    sp_us=g("sp_in_us")
    c.rect(464,y-26,76,26,stroke=1,fill=0)
    c.setFont("Helvetica",7); c.drawString(466,y-9,"15. In U.S.?")
    chk(c,466,y-20,"Yes",sp_us=="Yes"); chk(c,496,y-20,"No",sp_us=="No")
    y-=28
    box(c,72,y-24,180,24,"16. Place of last entry into U.S.",g("sp_entry_place"))
    box(c,252,y-24,120,24,"17. Date of last entry (mm/dd/yyyy)",g("sp_entry_date"))
    box(c,372,y-24,100,24,"18. I-94 Number",g("sp_i94"))
    box(c,472,y-24,68,24,"19. Status admitted",g("sp_status_admit"))
    y-=26
    box(c,72,y-24,160,24,"20. Current immigration status",g("sp_cur_status"))
    box(c,232,y-24,120,24,"21. Expiration of authorized stay",g("sp_status_exp"))
    sp_court=g("sp_court")
    c.rect(352,y-24,120,24,stroke=1,fill=0)
    c.setFont("Helvetica",7); c.drawString(354,y-9,"22. In Court proceedings?")
    chk(c,354,y-18,"Yes",sp_court=="Yes"); chk(c,390,y-18,"No",sp_court=="No")
    box(c,472,y-24,68,24,"23. Prev arrival date",g("sp_prev_arrival"))
    y-=26
    sp_inc=g("sp_include")
    c.rect(72,y-24,468,24,stroke=1,fill=0)
    c.setFont("Helvetica",8); c.drawString(74,y-13,"24. Include spouse in this application?")
    chk(c,260,y-18,"Yes",sp_inc=="Yes"); chk(c,300,y-18,"No",sp_inc=="No")
    y-=30

    # Children header
    c.setFont("Helvetica-Bold",9); c.drawString(72,y,"Your Children"); y-=14
    no_ch=g("no_children")
    c.rect(72,y-18,468,18,stroke=1,fill=0)
    chk(c,74,y-14,"I do not have any children.",no_ch=="Yes",8)
    num=g("num_children")
    c.setFont("Helvetica",8); c.drawString(280,y-12,f"Total number of children: {num}"); y-=20

    # Print up to 4 children compactly
    for cn in range(1,5):
        p=f"c{cn}_"
        cl=g(f"{p}last"); cf=g(f"{p}first")
        if not cl and not cf: continue
        c.setFont("Helvetica-Bold",7); c.drawString(72,y,f"Child {cn}"); y-=10
        box(c,72,y-22,130,22,f"C{cn} Last Name",cl)
        box(c,202,y-22,110,22,"First Name",cf)
        box(c,312,y-22,100,22,"8. Date of Birth",g(f"{p}dob"))
        box(c,412,y-22,128,22,"10. Nationality",g(f"{p}nationality"))
        y-=24
        box(c,72,y-22,100,22,"9. City/Country Birth",g(f"{p}birth_city"))
        box(c,172,y-22,60,22,"11. Race/Ethnic",g(f"{p}race"))
        ch_sex=g(f"{p}sex"); ch_us=g(f"{p}in_us")
        c.rect(232,y-22,60,22,stroke=1,fill=0)
        c.setFont("Helvetica",7); c.drawString(234,y-9,"12. Sex")
        chk(c,234,y-17,"M",ch_sex=="Male"); chk(c,258,y-17,"F",ch_sex=="Female")
        c.rect(292,y-22,70,22,stroke=1,fill=0)
        c.setFont("Helvetica",7); c.drawString(294,y-9,"13. In U.S.?")
        chk(c,294,y-17,"Yes",ch_us=="Yes"); chk(c,320,y-17,"No",ch_us=="No")
        box(c,362,y-22,108,22,"14. Place last U.S. entry",g(f"{p}entry_place"))
        box(c,470,y-22,70,22,"15. Entry date",g(f"{p}entry_date"))
        y-=24
        box(c,72,y-20,100,20,"16. I-94",g(f"{p}i94"))
        box(c,172,y-20,130,20,"17. Status admitted",g(f"{p}status_admit"))
        box(c,302,y-20,130,20,"18. Current status",g(f"{p}cur_status"))
        box(c,432,y-20,108,20,"19. Status expiry",g(f"{p}status_exp"))
        y-=22
        ch_court=g(f"{p}court"); ch_inc=g(f"{p}include")
        c.rect(72,y-18,468,18,stroke=1,fill=0)
        c.setFont("Helvetica",7); c.drawString(74,y-12,"20. In Court proceedings?")
        chk(c,200,y-14,"Yes",ch_court=="Yes"); chk(c,234,y-14,"No",ch_court=="No")
        c.drawString(280,y-12,"21. Include in application?")
        chk(c,410,y-14,"Yes",ch_inc=="Yes"); chk(c,444,y-14,"No",ch_inc=="No")
        y-=20
        if y < 80: c.showPage(); header(c); footer(c,2,TOTAL); y=H-100

    # PAGE 3 — Part A.III Background
    c.showPage(); header(c); footer(c,3,TOTAL); y=H-100
    y=sec_hdr(c,y,"Part A.III.  Information About Your Background")

    # Item 1 — last home address
    c.setFont("Helvetica",8); c.drawString(72,y,"1. Last address where you lived before coming to the United States:"); y-=12
    for row,(sk,ck,dk,ctk,fk,tk) in enumerate([
        ("h1_street","h1_city","h1_dept","h1_country","h1_from","h1_to"),
        ("h2_street","h2_city","h2_dept","h2_country","h2_from","h2_to"),
    ]):
        box(c,72,y-22,120,22,"Number and Street",g(sk))
        box(c,192,y-22,90,22,"City/Town",g(ck))
        box(c,282,y-22,100,22,"Dept/Province/State",g(dk))
        box(c,382,y-22,60,22,"Country",g(ctk))
        box(c,442,y-22,45,22,"From",g(fk))
        box(c,487,y-22,53,22,"To",g(tk))
        y-=24

    # Item 2 — 5 years residences
    c.setFont("Helvetica",8); c.drawString(72,y,"2. Residences during the past 5 years (list present address first):"); y-=12
    for n in range(1,6):
        p=f"r{n}_"
        if not any([g(f"{p}street"),g(f"{p}city"),g(f"{p}country")]): continue
        box(c,72,y-20,120,20,"Number and Street",g(f"{p}street"))
        box(c,192,y-20,90,20,"City/Town",g(f"{p}city"))
        box(c,282,y-20,100,20,"Dept/Province/State",g(f"{p}dept"))
        box(c,382,y-20,60,20,"Country",g(f"{p}country"))
        box(c,442,y-20,45,20,"From",g(f"{p}from"))
        box(c,487,y-20,53,20,"To",g(f"{p}to"))
        y-=22

    # Item 3 — Education
    c.setFont("Helvetica",8); c.drawString(72,y,"3. Education (beginning with most recent school):"); y-=12
    for n in range(1,5):
        p=f"edu{n}_"
        if not g(f"{p}name"): continue
        box(c,72,y-20,140,20,"Name of School",g(f"{p}name"))
        box(c,212,y-20,100,20,"Type",g(f"{p}type"))
        box(c,312,y-20,130,20,"Location (Address)",g(f"{p}loc"))
        box(c,442,y-20,45,20,"From",g(f"{p}from"))
        box(c,487,y-20,53,20,"To",g(f"{p}to"))
        y-=22

    # Item 4 — Employment
    c.setFont("Helvetica",8); c.drawString(72,y,"4. Employment during past 5 years (list present employment first):"); y-=12
    for n in range(1,4):
        p=f"emp{n}_"
        if not g(f"{p}name"): continue
        box(c,72,y-20,220,20,"Name and Address of Employer",g(f"{p}name"))
        box(c,292,y-20,150,20,"Your Occupation",g(f"{p}occ"))
        box(c,442,y-20,45,20,"From",g(f"{p}from"))
        box(c,487,y-20,53,20,"To",g(f"{p}to"))
        y-=22

    # Item 5 — Parents and siblings
    c.setFont("Helvetica",8); c.drawString(72,y,"5. Parents and siblings (check box if deceased):"); y-=12
    for role,nk,bk,lk,dk in [
        ("Mother","mother_name","mother_birth","mother_location","mother_deceased"),
        ("Father","father_name","father_birth","father_location","father_deceased"),
    ]+[(f"Sibling {n}",f"sib{n}_name",f"sib{n}_birth",f"sib{n}_location",f"sib{n}_deceased") for n in range(1,5)]:
        nm=g(nk); bi=g(bk); lo=g(lk); dec=g(dk)
        if not nm and not bi and not lo: continue
        c.setFont("Helvetica",8); c.drawString(72,y-14,f"{role}:")
        box(c,130,y-18,160,18,"Full Name",nm)
        box(c,290,y-18,160,18,"City/Country of Birth",bi)
        box(c,450,y-18,70,18,"Current Location",lo)
        if dec=="Yes": chk(c,522,y-14,"Deceased",True,7)
        y-=20

    # PAGE 4 — Part B
    c.showPage(); header(c); footer(c,4,TOTAL); y=H-100
    y=sec_hdr(c,y,"Part B.  Information About Your Application")
    c.setFont("Helvetica",8); c.drawString(72,y,"1. I am seeking asylum or withholding of removal based on (check all that apply):"); y-=14
    bases=[("Race","basis_race"),("Religion","basis_religion"),("Nationality","basis_nationality"),("Political opinion","basis_political"),("Membership in a particular social group","basis_social"),("Torture Convention","basis_torture")]
    xp=72
    for label,key in bases:
        chk(c,xp,y-10,label,g(key)=="Yes",8); xp+=len(label)*5.4+22
    y-=18
    c.setFont("Helvetica-Bold",8); c.drawString(72,y,"A. Have you, your family, or close friends/colleagues ever experienced harm, mistreatment, or threats?")
    y-=11; hp=g("harm_past")
    chk(c,72,y-10,"Yes",hp=="Yes"); chk(c,110,y-10,"No",hp=="No"); y-=18
    ta(c,72,y-160,468,160,"If Yes — explain: (1) What happened; (2) When; (3) Who caused it; (4) Why you believe it occurred.",g("harm_past_detail"))
    y-=162
    c.setFont("Helvetica-Bold",8); c.drawString(72,y,"B. Do you fear harm or mistreatment if you return to your home country?")
    y-=11; fp=g("fear_future")
    chk(c,72,y-10,"Yes",fp=="Yes"); chk(c,110,y-10,"No",fp=="No"); y-=18
    ta(c,72,y-120,468,120,"If Yes — explain: (1) What harm you fear; (2) Who would harm you; (3) Why.",g("fear_future_detail"))
    y-=122
    c.setFont("Helvetica-Bold",8); c.drawString(72,y,"2. Have you or your family ever been accused, charged, arrested, detained, interrogated, convicted, or imprisoned outside the U.S.?")
    y-=11; ao=g("arrested_outside")
    chk(c,72,y-10,"Yes",ao=="Yes"); chk(c,110,y-10,"No",ao=="No"); y-=18
    ta(c,72,y-80,468,80,"If Yes — explain circumstances and reasons:",g("arrested_outside_detail"))
    y-=82
    c.setFont("Helvetica-Bold",8); c.drawString(72,y,"3A. Have you or your family belonged to or been associated with any organizations or groups in your home country?")
    y-=11; ob=g("orgs_belonged")
    chk(c,72,y-10,"Yes",ob=="Yes"); chk(c,110,y-10,"No",ob=="No"); y-=18
    ta(c,72,y-80,468,80,"If Yes — describe participation, leadership positions, length of time:",g("orgs_belonged_detail"))
    y-=82
    c.setFont("Helvetica-Bold",8); c.drawString(72,y,"3B. Do you or your family continue to participate in these organizations or groups?")
    y-=11; oc=g("orgs_continue")
    chk(c,72,y-10,"Yes",oc=="Yes"); chk(c,110,y-10,"No",oc=="No"); y-=18
    ta(c,72,y-60,468,60,"If Yes — describe current participation and positions:",g("orgs_continue_detail"))
    y-=62
    c.setFont("Helvetica-Bold",8); c.drawString(72,y,"4. Are you afraid of being subjected to torture in your home country or any other country to which you may be returned?")
    y-=11; tf=g("torture_fear")
    chk(c,72,y-10,"Yes",tf=="Yes"); chk(c,110,y-10,"No",tf=="No"); y-=18
    ta(c,72,y-70,468,70,"If Yes — explain why you are afraid and describe the nature of torture, by whom, and why:",g("torture_fear_detail"))

    # PAGE 5 — Part C
    c.showPage(); header(c); footer(c,5,TOTAL); y=H-100
    y=sec_hdr(c,y,"Part C.  Additional Information About Your Application")
    part_c=[
        ("1. Have you, your spouse, children, parents, or siblings ever applied to the U.S. Government for refugee status, asylum, or withholding of removal?","prior_asylum","prior_asylum_detail","If Yes — explain the decision, status received, and any changes in country conditions since denial:"),
        ("2A. After leaving your home country, did you travel through or reside in any other country before entering the United States?","transit",None,None),
        ("2B. Have you, your spouse, children, or other family members ever applied for or received lawful status in any country other than your home country?","other_status","transit_detail","2A/2B. If Yes to either — for each person: country, length of stay, status, reasons for leaving, entitlement to return, asylum applied:"),
        ("3. Have you, your spouse, or children ever ordered, incited, assisted, or participated in causing harm to any person because of race, religion, nationality, social group, or political opinion?","caused_harm","caused_harm_detail","If Yes — describe each incident and involvement:"),
        ("4. After leaving the country where you were harmed or fear harm, did you return to that country?","returned","returned_detail","If Yes — describe date(s), purpose(s), and length of visit(s):"),
        ("5. Are you filing this application more than 1 year after your last arrival in the United States?","late_filing","late_filing_detail","If Yes — explain why you did not file within the first year:"),
        ("6. Have you or any family member included in this application ever been arrested, charged, convicted, or sentenced in the United States?","us_crimes","us_crimes_detail","If Yes — for each instance: what occurred, dates, sentence length, location, detention duration, reason, charges, release reason:"),
    ]
    for qtext, yk, dk, dl in part_c:
        if y<90: c.showPage(); header(c); footer(c,5,TOTAL); y=H-100
        c.setFont("Helvetica-Bold",8)
        words=qtext.split(); line=""; lines=[]
        for w in words:
            t=(line+" "+w).strip()
            if len(t)<=100: line=t
            else: lines.append(line); line=w
        if line: lines.append(line)
        for ln in lines: c.drawString(72,y,ln); y-=10
        ans=g(yk)
        chk(c,72,y-10,"Yes",ans=="Yes"); chk(c,110,y-10,"No",ans=="No"); y-=18
        if dk and g(dk):
            h2=50
            ta(c,72,y-h2,468,h2,dl or "",g(dk)); y-=h2+2
        y-=4

    # PAGE 6 — Part D Signature
    c.showPage(); header(c); footer(c,6,TOTAL); y=H-100
    y=sec_hdr(c,y,"Part D.  Your Signature")
    c.setFont("Helvetica",7)
    cert=("I certify, under penalty of perjury under the laws of the United States of America, that this application "
          "and the evidence submitted with it are all true and correct. I certify that I am physically present in the "
          "United States or seeking admission at a Port of Entry when I execute this application.")
    words=cert.split(); line=""; lines=[]
    for w in words:
        t=(line+" "+w).strip()
        if len(t)<=118: line=t
        else: lines.append(line); line=w
    if line: lines.append(line)
    for ln in lines: c.drawString(72,y,ln); y-=9
    y-=6
    full=f"{g('first_name')} {g('last_name')}".strip()
    box(c,72,y-28,230,28,"Print your complete name",full)
    box(c,302,y-28,238,28,"Write your name in your native alphabet","")
    y-=30
    c.rect(72,y-52,300,52,stroke=1,fill=0)
    c.setFont("Helvetica",7); c.drawString(74,y-10,"Signature of Applicant")
    c.setFont("Helvetica",8); c.drawString(74,y-30,"[ Sign here ]")
    c.rect(372,y-52,168,52,stroke=1,fill=0)
    c.setFont("Helvetica",7); c.drawString(374,y-10,"Date (mm/dd/yyyy)")
    y-=54
    c.rect(72,y-24,468,24,stroke=1,fill=0)
    c.setFont("Helvetica",8)
    c.drawString(74,y-14,"Did someone other than your spouse/parent/child prepare this application?")
    chk(c,350,y-16,"No",True); chk(c,388,y-16,"Yes (complete Part E)",False)
    y-=30
    y=sec_hdr(c,y-4,"Part E.  Declaration of Person Preparing Form (if other than applicant)")
    c.setFont("Helvetica",7)
    c.drawString(72,y,"Complete this section if a helper, teacher, lawyer, or advocate prepared this application.")
    y-=16
    box(c,72,y-28,230,28,"Signature of Preparer","")
    box(c,302,y-28,238,28,"Print Complete Name of Preparer","")
    y-=30
    box(c,72,y-28,360,28,"Address of Preparer — Street Number and Name","")
    box(c,432,y-28,108,28,"Date (mm/dd/yyyy)","")
    y-=30
    box(c,72,y-28,160,28,"City","")
    box(c,232,y-28,80,28,"State","")
    box(c,312,y-28,80,28,"Zip Code","")
    box(c,392,y-28,148,28,"Daytime Telephone Number","")

    c.save()
    return buf.getvalue()


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length=int(self.headers.get("Content-Length",0))
        body=self.rfile.read(length)
        try:
            data=json.loads(body)
            pdf=make_pdf(data)
            self.send_response(200)
            self.send_header("Content-Type","application/pdf")
            self.send_header("Content-Disposition","attachment; filename=\"i589-draft.pdf\"")
            self.send_header("Content-Length",str(len(pdf)))
            self.send_header("Access-Control-Allow-Origin","*")
            self.end_headers()
            self.wfile.write(pdf)
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type","application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error":str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin","*")
        self.send_header("Access-Control-Allow-Methods","POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers","Content-Type")
        self.end_headers()

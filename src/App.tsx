import { useState, useEffect } from "react";

interface Language { code: string; label: string; nativeLabel: string; rtl: boolean; flag: string; }
interface Field { id: string; en: string; es: string; ar: string; fr: string; type: "text"|"date"|"select"|"textarea"|"yesno"|"note"; opts?: string[][]; tall?: boolean; req?: boolean; }
interface Section { id: string; en: string; es: string; ar: string; fr: string; short_en: string; short_es: string; short_ar: string; short_fr: string; fields: Field[]; }

const LANGS: Language[] = [
  { code:"en", label:"English",  nativeLabel:"English",  rtl:false, flag:"🇺🇸" },
  { code:"es", label:"Spanish",  nativeLabel:"Español",  rtl:false, flag:"🇪🇸" },
  { code:"ar", label:"Arabic",   nativeLabel:"العربية",  rtl:true,  flag:"🇸🇦" },
  { code:"fr", label:"French",   nativeLabel:"Français", rtl:false, flag:"🇫🇷" },
];

const C = {
  teal:"#0F6E56", tealL:"#E1F5EE", tealB:"#5DCAA5",
  amber:"#BA7517", amberL:"#FAEEDA", amberB:"#EF9F27",
  gray:"#F7F7F5", border:"#D3D1C7", white:"#FFFFFF",
  text:"#1a1a1a", mid:"#555", light:"#999", red:"#E24B4A",
};

const UI: Record<string,Record<string,string>> = {
  title:       {en:"Asylum Application Helper",es:"Asistente de Solicitud de Asilo",ar:"مساعد طلب اللجوء",fr:"Assistant de Demande d'Asile"},
  subtitle:    {en:"USCIS Form I-589",es:"Formulario USCIS I-589",ar:"نموذج USCIS I-589",fr:"Formulaire USCIS I-589"},
  desc:        {en:"Fill each section in your language. At the end review both versions and export as PDF.",es:"Complete cada sección en su idioma. Al final revise ambas versiones y exporte como PDF.",ar:"أكمل كل قسم بلغتك. في النهاية راجع كلتا النسختين وصدّر كملف PDF.",fr:"Remplissez chaque section dans votre langue. À la fin révisez les deux versions et exportez en PDF."},
  answered_in: {en:"I answered in:",es:"Respondí en:",ar:"أجبت بـ:",fr:"J'ai répondu en:"},
  in_english:  {en:"English",es:"Inglés",ar:"الإنجليزية",fr:"Anglais"},
  type_here:   {en:"Type here…",es:"Escriba aquí…",ar:"اكتب هنا…",fr:"Écrivez ici…"},
  select:      {en:"— Select —",es:"— Seleccione —",ar:"— اختر —",fr:"— Sélectionner —"},
  prev:        {en:"← Previous",es:"← Anterior",ar:"→ السابق",fr:"← Précédent"},
  next:        {en:"Next →",es:"Siguiente →",ar:"← التالي",fr:"Suivant →"},
  review:      {en:"Review & Export →",es:"Revisar y Exportar →",ar:"مراجعة وتصدير ←",fr:"Réviser et Exporter →"},
  translating: {en:"Translating…",es:"Traduciendo…",ar:"جارٍ الترجمة…",fr:"Traduction en cours…"},
  trans_here:  {en:"Translation will appear here",es:"La traducción aparecerá aquí",ar:"ستظهر الترجمة هنا",fr:"La traduction apparaîtra ici"},
  needs_trans: {en:"⚠ needs English translation",es:"⚠ necesita traducción al inglés",ar:"⚠ يحتاج ترجمة إنجليزية",fr:"⚠ nécessite traduction anglaise"},
  filled:      {en:"fields filled",es:"campos completados",ar:"حقول مكتملة",fr:"champs remplis"},
  rev_title:   {en:"Review Your Application",es:"Revise Su Solicitud",ar:"راجع طلبك",fr:"Révisez Votre Demande"},
  rev_desc:    {en:"Check both versions. Export as PDF when ready.",es:"Revise ambas versiones. Exporte como PDF cuando esté listo.",ar:"راجع كلتا النسختين. صدّر كملف PDF عند الاستعداد.",fr:"Vérifiez les deux versions. Exportez en PDF quand vous êtes prêt."},
  back:        {en:"← Back to form",es:"← Volver al formulario",ar:"→ العودة للنموذج",fr:"← Retour au formulaire"},
  dl_en:       {en:"↓ Download English .txt",es:"↓ Descargar PDF en inglés",ar:"↓ تحميل PDF بالإنجليزية",fr:"↓ Télécharger PDF anglais"},
  dl_nat:      {en:"↓ Download your language .txt",es:"↓ Descargar PDF en español",ar:"↓ تحميل PDF بالعربية",fr:"↓ Télécharger PDF français"},
  gen_pdf:     {en:"Generating PDF…",es:"Generando PDF…",ar:"جارٍ إنشاء PDF…",fr:"Génération du PDF…"},
  your_lang:   {en:"Your language — for review",es:"Tu idioma — para revisar",ar:"لغتك — للمراجعة",fr:"Votre langue — pour révision"},
  english_ver: {en:"English — for submission",es:"Inglés — para presentar",ar:"الإنجليزية — للتقديم",fr:"Anglais — pour soumission"},
};

const SEX: string[][] = [["Male","Masculino","ذكر","Homme"],["Female","Femenino","أنثى","Femme"]];
const MARITAL: string[][] = [["Single","Soltero/a","أعزب/عزباء","Célibataire"],["Married","Casado/a","متزوج/ة","Marié·e"],["Divorced","Divorciado/a","مطلق/ة","Divorcé·e"],["Widowed","Viudo/a","أرمل/ة","Veuf/Veuve"]];
const COURT: string[][] = [["Never been in proceedings","Nunca en procedimientos","لم أكن في إجراءات قط","Jamais en procédure"],["Currently in proceedings","Actualmente en procedimientos","حالياً في إجراءات","Actuellement en procédure"],["Not now, but have been before","No ahora, pero estuve antes","لا الآن، لكن كنت في إجراءات","Pas maintenant, mais l'ai été"]];

function childFields(n: number): Field[] {
  const p = `c${n}_`;
  const N = String(n);
  const CM: string[][] = [["Single","Soltero/a","أعزب/عزباء","Célibataire"],["Married","Casado/a","متزوج/ة","Marié·e"],["Divorced","Divorciado/a","مطلق/ة","Divorcé·e"],["Widowed","Viudo/a","أرمل/ة","Veuf/Veuve"]];
  return [
    {id:`${p}a_num`,          en:`Child ${N} — 1. Alien Registration Number (A-Number) (if any)`,         es:`Hijo/a ${N} — 1. Número de Registro de Extranjero (A-Number) (si tiene)`, ar:`الطفل ${N} — ١. رقم تسجيل الأجنبي (A-Number) (إن وجد)`, fr:`Enfant ${N} — 1. Numéro d'enregistrement étranger (A-Number) (si applicable)`, type:"text"},
    {id:`${p}passport`,       en:`Child ${N} — 2. Passport/ID Card Number (if any)`,                      es:`Hijo/a ${N} — 2. Número de pasaporte/ID`,       ar:`الطفل ${N} — ٢. رقم جواز السفر/الهوية`, fr:`Enfant ${N} — 2. Numéro de passeport/ID`, type:"text"},
    {id:`${p}marital`,        en:`Child ${N} — 3. Marital Status (Married, Single, Divorced, Widowed)`,   es:`Hijo/a ${N} — 3. Estado civil (Casado/a, Soltero/a, Divorciado/a, Viudo/a)`, ar:`الطفل ${N} — ٣. الحالة الاجتماعية (متزوج/ة، أعزب/عزباء، مطلق/ة، أرمل/ة)`, fr:`Enfant ${N} — 3. État civil (Marié·e, Célibataire, Divorcé·e, Veuf/Veuve)`, type:"select", opts:CM},
    {id:`${p}ssn`,            en:`Child ${N} — 4. U.S. Social Security Number (if any)`,                  es:`Hijo/a ${N} — 4. Número de Seguro Social de EE.UU. (si tiene)`, ar:`الطفل ${N} — ٤. رقم الضمان الاجتماعي الأمريكي (إن وجد)`, fr:`Enfant ${N} — 4. Numéro de sécurité sociale US (si applicable)`, type:"text"},
    {id:`${p}last`,           en:`Child ${N} — 5. Complete Last Name`,                                    es:`Hijo/a ${N} — 5. Apellido completo`,            ar:`الطفل ${N} — ٥. اسم العائلة الكامل`,    fr:`Enfant ${N} — 5. Nom de famille complet`, type:"text"},
    {id:`${p}first`,          en:`Child ${N} — 6. First Name`,                                            es:`Hijo/a ${N} — 6. Nombre`,                      ar:`الطفل ${N} — ٦. الاسم الأول`,           fr:`Enfant ${N} — 6. Prénom`, type:"text"},
    {id:`${p}middle`,         en:`Child ${N} — 7. Middle Name`,                                           es:`Hijo/a ${N} — 7. Segundo nombre`,              ar:`الطفل ${N} — ٧. الاسم الأوسط`,          fr:`Enfant ${N} — 7. Deuxième prénom`, type:"text"},
    {id:`${p}dob`,            en:`Child ${N} — 8. Date of Birth (mm/dd/yyyy)`,                            es:`Hijo/a ${N} — 8. Fecha de nacimiento (mm/dd/aaaa)`, ar:`الطفل ${N} — ٨. تاريخ الميلاد`, fr:`Enfant ${N} — 8. Date de naissance (mm/jj/aaaa)`, type:"date"},
    {id:`${p}birth_city`,     en:`Child ${N} — 9. City and Country of Birth`,                             es:`Hijo/a ${N} — 9. Ciudad y país de nacimiento`, ar:`الطفل ${N} — ٩. مدينة وبلد الميلاد`,    fr:`Enfant ${N} — 9. Ville et pays de naissance`, type:"text"},
    {id:`${p}nationality`,    en:`Child ${N} — 10. Nationality (Citizenship)`,                            es:`Hijo/a ${N} — 10. Nacionalidad (ciudadanía)`,  ar:`الطفل ${N} — ١٠. الجنسية (المواطنة)`,   fr:`Enfant ${N} — 10. Nationalité (citoyenneté)`, type:"text"},
    {id:`${p}race`,           en:`Child ${N} — 11. Race, Ethnic, or Tribal Group`,                        es:`Hijo/a ${N} — 11. Raza, grupo étnico o tribal`, ar:`الطفل ${N} — ١١. العرق أو المجموعة العرقية أو القبلية`, fr:`Enfant ${N} — 11. Race, groupe ethnique ou tribal`, type:"text"},
    {id:`${p}sex`,            en:`Child ${N} — 12. Sex`,                                                  es:`Hijo/a ${N} — 12. Sexo`,                       ar:`الطفل ${N} — ١٢. الجنس`,                fr:`Enfant ${N} — 12. Sexe`, type:"select", opts:SEX},
    {id:`${p}in_us`,          en:`Child ${N} — 13. Is this child in the U.S.? (If Yes, complete Blocks 14 to 21. If No, specify location below.)`, es:`Hijo/a ${N} — 13. ¿Está este/a hijo/a en EE.UU.? (Si Sí, complete los Bloques 14 al 21. Si No, especifique la ubicación abajo.)`, ar:`الطفل ${N} — ١٣. هل هذا الطفل في الولايات المتحدة؟ (إن نعم، أكمل البنود ١٤-٢١. إن لا، حدد الموقع أدناه.)`, fr:`Enfant ${N} — 13. Cet enfant est-il/elle aux États-Unis? (Si Oui, compléter les cases 14 à 21. Si Non, préciser le lieu ci-dessous.)`, type:"yesno"},
    {id:`${p}location_no`,    en:`Child ${N} — 13. If No — Specify location`,                             es:`Hijo/a ${N} — 13. Si No — Especifique la ubicación`, ar:`الطفل ${N} — ١٣. إن لا — حدد الموقع`, fr:`Enfant ${N} — 13. Si Non — Préciser le lieu`, type:"text"},
    {id:`${p}entry_place`,    en:`Child ${N} — 14. Place of last entry into the U.S.`,                    es:`Hijo/a ${N} — 14. Lugar de última entrada a EE.UU.`, ar:`الطفل ${N} — ١٤. مكان آخر دخول لأمريكا`, fr:`Enfant ${N} — 14. Lieu de dernière entrée aux États-Unis`, type:"text"},
    {id:`${p}entry_date`,     en:`Child ${N} — 15. Date of last entry into the U.S. (mm/dd/yyyy)`,        es:`Hijo/a ${N} — 15. Fecha de última entrada a EE.UU.`, ar:`الطفل ${N} — ١٥. تاريخ آخر دخول لأمريكا`, fr:`Enfant ${N} — 15. Date de dernière entrée aux États-Unis`, type:"date"},
    {id:`${p}i94`,            en:`Child ${N} — 16. I-94 Number (if any)`,                                 es:`Hijo/a ${N} — 16. Número I-94 (si tiene)`,     ar:`الطفل ${N} — ١٦. رقم I-94 (إن وجد)`,    fr:`Enfant ${N} — 16. Numéro I-94 (si applicable)`, type:"text"},
    {id:`${p}status_admit`,   en:`Child ${N} — 17. Status when last admitted (Visa type, if any)`,        es:`Hijo/a ${N} — 17. Estatus al ser admitido (tipo de visa, si aplica)`, ar:`الطفل ${N} — ١٧. الحالة عند آخر دخول (نوع التأشيرة إن وجد)`, fr:`Enfant ${N} — 17. Statut lors de la dernière admission (type de visa, si applicable)`, type:"text"},
    {id:`${p}cur_status`,     en:`Child ${N} — 18. What is your child's current status?`,                 es:`Hijo/a ${N} — 18. ¿Cuál es el estatus migratorio actual de su hijo/a?`, ar:`الطفل ${N} — ١٨. ما هي الحالة المهاجرية الحالية لطفلك؟`, fr:`Enfant ${N} — 18. Quel est le statut actuel de votre enfant?`, type:"text"},
    {id:`${p}status_exp`,     en:`Child ${N} — 19. What is the expiration date of his/her authorized stay, if any? (mm/dd/yyyy)`, es:`Hijo/a ${N} — 19. ¿Cuál es la fecha de vencimiento de la estadía autorizada, si aplica? (mm/dd/aaaa)`, ar:`الطفل ${N} — ١٩. ما هو تاريخ انتهاء إقامته/ها المرخصة إن وجد؟`, fr:`Enfant ${N} — 19. Quelle est la date d'expiration du séjour autorisé, le cas échéant? (mm/jj/aaaa)`, type:"date"},
    {id:`${p}court`,          en:`Child ${N} — 20. Is your child in Immigration Court proceedings?`,       es:`Hijo/a ${N} — 20. ¿Está su hijo/a en procedimientos de tribunal de inmigración?`, ar:`الطفل ${N} — ٢٠. هل طفلك في إجراءات محكمة الهجرة؟`, fr:`Enfant ${N} — 20. Votre enfant est-il/elle en procédure au tribunal d'immigration?`, type:"yesno"},
    {id:`${p}include`,        en:`Child ${N} — 21. If in the U.S., is this child to be included in this application? (Check the appropriate box.)`, es:`Hijo/a ${N} — 21. Si está en EE.UU., ¿se incluirá este/a hijo/a en esta solicitud? (Marque la casilla apropiada.)`, ar:`الطفل ${N} — ٢١. إن كان في الولايات المتحدة، هل سيُضم هذا الطفل في هذا الطلب؟ (ضع علامة في الخانة المناسبة.)`, fr:`Enfant ${N} — 21. Si aux États-Unis, cet enfant sera-t-il/elle inclus·e dans cette demande? (Cochez la case appropriée.)`, type:"yesno"},
  ];
}

function resRow(n: number): Field[] {
  const p = `r${n}_`;
  const N = String(n);
  return [
    {id:`${p}street`,  en:`2. Residence (past 5 yrs) — Row ${N} — Number and Street`,      es:`2. Residencias — Fila ${N} — Calle y número`,      ar:`٢. مساكن — صف ${N} — الشارع والرقم`,      fr:`2. Résidences — Rangée ${N} — Numéro et rue`,      type:"text"},
    {id:`${p}city`,    en:`2. Residence (past 5 yrs) — Row ${N} — City/Town`,               es:`2. Residencias — Fila ${N} — Ciudad/Pueblo`,       ar:`٢. مساكن — صف ${N} — المدينة/البلدة`,     fr:`2. Résidences — Rangée ${N} — Ville/Commune`,      type:"text"},
    {id:`${p}dept`,    en:`2. Residence (past 5 yrs) — Row ${N} — Dept/Province/State`,     es:`2. Residencias — Fila ${N} — Dpto/Provincia/Estado`,ar:`٢. مساكن — صف ${N} — المحافظة/الإقليم`,  fr:`2. Résidences — Rangée ${N} — Département/Province/État`, type:"text"},
    {id:`${p}country`, en:`2. Residence (past 5 yrs) — Row ${N} — Country`,                 es:`2. Residencias — Fila ${N} — País`,                ar:`٢. مساكن — صف ${N} — البلد`,              fr:`2. Résidences — Rangée ${N} — Pays`,               type:"text"},
    {id:`${p}from`,    en:`2. Residence (past 5 yrs) — Row ${N} — From (Mo/Yr)`,            es:`2. Residencias — Fila ${N} — Desde (Mes/Año)`,     ar:`٢. مساكن — صف ${N} — من (شهر/سنة)`,      fr:`2. Résidences — Rangée ${N} — Depuis (Mois/An)`,   type:"text"},
    {id:`${p}to`,      en:`2. Residence (past 5 yrs) — Row ${N} — To (Mo/Yr)`,              es:`2. Residencias — Fila ${N} — Hasta (Mes/Año)`,     ar:`٢. مساكن — صف ${N} — حتى (شهر/سنة)`,     fr:`2. Résidences — Rangée ${N} — Jusqu'à (Mois/An)`,  type:"text"},
  ];
}

function eduRow(n: number): Field[] {
  const p = `edu${n}_`;
  const N = String(n);
  return [
    {id:`${p}name`, en:`3. Education — School ${N} — Name of School`,          es:`3. Educación — Escuela ${N} — Nombre`,           ar:`٣. التعليم — مدرسة ${N} — الاسم`,              fr:`3. Éducation — École ${N} — Nom`,           type:"text"},
    {id:`${p}type`, en:`3. Education — School ${N} — Type of School`,          es:`3. Educación — Escuela ${N} — Tipo`,             ar:`٣. التعليم — مدرسة ${N} — النوع`,              fr:`3. Éducation — École ${N} — Type`,          type:"text"},
    {id:`${p}loc`,  en:`3. Education — School ${N} — Location (Address)`,      es:`3. Educación — Escuela ${N} — Ubicación`,        ar:`٣. التعليم — مدرسة ${N} — الموقع (العنوان)`,  fr:`3. Éducation — École ${N} — Lieu (adresse)`,type:"text"},
    {id:`${p}from`, en:`3. Education — School ${N} — Attended From (Mo/Yr)`,   es:`3. Educación — Escuela ${N} — Desde (Mes/Año)`, ar:`٣. التعليم — مدرسة ${N} — من (شهر/سنة)`,      fr:`3. Éducation — École ${N} — Depuis (Mois/An)`, type:"text"},
    {id:`${p}to`,   en:`3. Education — School ${N} — Attended To (Mo/Yr)`,     es:`3. Educación — Escuela ${N} — Hasta (Mes/Año)`, ar:`٣. التعليم — مدرسة ${N} — حتى (شهر/سنة)`,     fr:`3. Éducation — École ${N} — Jusqu'à (Mois/An)`, type:"text"},
  ];
}

function empRow(n: number): Field[] {
  const p = `emp${n}_`;
  const N = String(n);
  return [
    {id:`${p}name`, en:`4. Employment — Employer ${N} — Name and Address of Employer`, es:`4. Empleo — Empleador ${N} — Nombre y dirección`, ar:`٤. العمل — صاحب العمل ${N} — الاسم والعنوان`, fr:`4. Emploi — Employeur ${N} — Nom et adresse`, type:"text"},
    {id:`${p}occ`,  en:`4. Employment — Employer ${N} — Your Occupation`,              es:`4. Empleo — Empleador ${N} — Su ocupación`,      ar:`٤. العمل — صاحب العمل ${N} — مهنتك`,          fr:`4. Emploi — Employeur ${N} — Votre profession`, type:"text"},
    {id:`${p}from`, en:`4. Employment — Employer ${N} — From (Mo/Yr)`,                 es:`4. Empleo — Empleador ${N} — Desde (Mes/Año)`,  ar:`٤. العمل — صاحب العمل ${N} — من (شهر/سنة)`,  fr:`4. Emploi — Employeur ${N} — Depuis (Mois/An)`, type:"text"},
    {id:`${p}to`,   en:`4. Employment — Employer ${N} — To (Mo/Yr)`,                   es:`4. Empleo — Empleador ${N} — Hasta (Mes/Año)`,  ar:`٤. العمل — صاحب العمل ${N} — حتى (شهر/سنة)`, fr:`4. Emploi — Employeur ${N} — Jusqu'à (Mois/An)`, type:"text"},
  ];
}

function sibFields(n: number): Field[] {
  const p = `sib${n}_`;
  const N = String(n);
  return [
    {id:`${p}name`,     en:`5. Sibling ${N} — Full Name`,                       es:`5. Hermano/a ${N} — Nombre completo`,            ar:`٥. الأخ/الأخت ${N} — الاسم الكامل`,           fr:`5. Frère/Sœur ${N} — Nom complet`,           type:"text"},
    {id:`${p}birth`,    en:`5. Sibling ${N} — City/Town and Country of Birth`,  es:`5. Hermano/a ${N} — Ciudad y país de nacimiento`,ar:`٥. الأخ/الأخت ${N} — مدينة وبلد الميلاد`,      fr:`5. Frère/Sœur ${N} — Ville et pays de naissance`, type:"text"},
    {id:`${p}location`, en:`5. Sibling ${N} — Current Location`,                es:`5. Hermano/a ${N} — Ubicación actual`,           ar:`٥. الأخ/الأخت ${N} — الموقع الحالي`,          fr:`5. Frère/Sœur ${N} — Lieu actuel`,           type:"text"},
    {id:`${p}deceased`, en:`5. Sibling ${N} — Deceased?`,                       es:`5. Hermano/a ${N} — ¿Fallecido/a?`,              ar:`٥. الأخ/الأخت ${N} — متوفى/ة؟`,               fr:`5. Frère/Sœur ${N} — Décédé·e?`,             type:"yesno"},
  ];
}

const SECTIONS: Section[] = [
  { id:"ai",
    en:"Part A.I — Information About You", es:"Parte A.I — Información Sobre Usted", ar:"الجزء أ.١ — معلوماتك الشخصية", fr:"Partie A.I — Informations Vous Concernant",
    short_en:"Part A.I", short_es:"Parte A.I", short_ar:"أ.١", short_fr:"Partie A.I",
    fields:[
      {id:"convention_torture",en:"NOTE: Check Yes to also apply for withholding under Convention Against Torture",es:"NOTA: Marque Sí para solicitar también suspensión bajo la Convención Contra la Tortura",ar:"ملاحظة: اختر نعم لتقدم أيضاً بطلب تعليق الترحيل بموجب اتفاقية مناهضة التعذيب",fr:"NOTE: Sélectionnez Oui pour demander aussi la suspension d'expulsion en vertu de la Convention contre la Torture",type:"yesno"},
      {id:"a_number",en:"1. Alien Registration Number (A-Number) (if any)",es:"1. Número de Registro de Extranjero (A-Number) (si tiene)",ar:"١. رقم تسجيل الأجنبي (A-Number) (إن وجد)",fr:"1. Numéro d'enregistrement étranger (A-Number) (si applicable)",type:"text"},
      {id:"ssn",en:"2. U.S. Social Security Number (if any)",es:"2. Número de Seguro Social de EE.UU. (si tiene)",ar:"٢. رقم الضمان الاجتماعي الأمريكي (إن وجد)",fr:"2. Numéro de sécurité sociale US (si applicable)",type:"text"},
      {id:"uscis_acct",en:"3. USCIS Online Account Number (if any)",es:"3. Número de Cuenta en Línea de USCIS (si tiene)",ar:"٣. رقم حساب USCIS الإلكتروني (إن وجد)",fr:"3. Numéro de compte USCIS en ligne (si applicable)",type:"text"},
      {id:"last_name",en:"4. Complete Last Name",es:"4. Apellido completo",ar:"٤. اسم العائلة الكامل",fr:"4. Nom de famille complet",type:"text",req:true},
      {id:"first_name",en:"5. First Name",es:"5. Nombre",ar:"٥. الاسم الأول",fr:"5. Prénom",type:"text",req:true},
      {id:"middle_name",en:"6. Middle Name",es:"6. Segundo nombre",ar:"٦. الاسم الأوسط",fr:"6. Deuxième prénom",type:"text"},
      {id:"aliases",en:"7. Other names used (include maiden name and aliases)",es:"7. Otros nombres usados (incluir apellido de soltera y alias)",ar:"٧. أسماء أخرى مستخدمة (بما في ذلك اسم قبل الزواج والأسماء المستعارة)",fr:"7. Autres noms utilisés (inclure nom de jeune fille et alias)",type:"text"},
      {id:"res_street",en:"8. Residence in the U.S. — Street Number and Name",es:"8. Residencia en EE.UU. — Número y nombre de calle",ar:"٨. العنوان في أمريكا — رقم واسم الشارع",fr:"8. Résidence aux États-Unis — Numéro et nom de rue",type:"text",req:true},
      {id:"res_apt",en:"8. Residence — Apt. Number",es:"8. Residencia — Número de apartamento",ar:"٨. العنوان — رقم الشقة",fr:"8. Résidence — Numéro d'appartement",type:"text"},
      {id:"res_city",en:"8. Residence — City",es:"8. Residencia — Ciudad",ar:"٨. العنوان — المدينة",fr:"8. Résidence — Ville",type:"text",req:true},
      {id:"res_state",en:"8. Residence — State",es:"8. Residencia — Estado",ar:"٨. العنوان — الولاية",fr:"8. Résidence — État",type:"text"},
      {id:"res_zip",en:"8. Residence — Zip Code",es:"8. Residencia — Código postal",ar:"٨. العنوان — الرمز البريدي",fr:"8. Résidence — Code postal",type:"text"},
      {id:"res_phone",en:"8. Residence — Telephone Number",es:"8. Residencia — Número de teléfono",ar:"٨. العنوان — رقم الهاتف",fr:"8. Résidence — Numéro de téléphone",type:"text"},
      {id:"res_note",en:"NOTE: You must be residing in the United States to submit this form.",es:"NOTA: Debe estar residiendo en los Estados Unidos para presentar este formulario.",ar:"ملاحظة: يجب أن تكون مقيماً في الولايات المتحدة لتقديم هذا النموذج.",fr:"NOTE: Vous devez résider aux États-Unis pour soumettre ce formulaire.",type:"note"},
      {id:"mail_note",en:"9. Mailing Address in the U.S. (if different than the address in Item Number 8) — Only complete if different from Item 8",es:"9. Dirección postal en EE.UU. (si es diferente a la dirección en el ítem 8) — Solo complete si es diferente al ítem 8",ar:"٩. عنوان البريد في الولايات المتحدة (إن كان مختلفاً عن عنوان البند ٨) — أكمل فقط إن كان مختلفاً عن البند ٨",fr:"9. Adresse postale aux États-Unis (si différente de l'adresse au Point 8) — Compléter uniquement si différente du Point 8",type:"note"},
      {id:"mail_care_of",en:"9. Mailing Address — In Care Of (if applicable)",es:"9. Dirección postal — A/c de (si aplica)",ar:"٩. عنوان البريد — بعناية (إن انطبق)",fr:"9. Adresse postale — Aux bons soins de (si applicable)",type:"text"},
      {id:"mail_phone",en:"9. Mailing Address — Telephone Number",es:"9. Dirección postal — Número de teléfono",ar:"٩. عنوان البريد — رقم الهاتف",fr:"9. Adresse postale — Numéro de téléphone",type:"text"},
      {id:"mail_street",en:"9. Mailing Address — Street Number and Name",es:"9. Dirección postal — Número y nombre de calle",ar:"٩. عنوان البريد — رقم واسم الشارع",fr:"9. Adresse postale — Numéro et nom de rue",type:"text"},
      {id:"mail_apt",en:"9. Mailing Address — Apt. Number",es:"9. Dirección postal — Número de apartamento",ar:"٩. عنوان البريد — رقم الشقة",fr:"9. Adresse postale — Numéro d'appartement",type:"text"},
      {id:"mail_city",en:"9. Mailing Address — City",es:"9. Dirección postal — Ciudad",ar:"٩. عنوان البريد — المدينة",fr:"9. Adresse postale — Ville",type:"text"},
      {id:"mail_state",en:"9. Mailing Address — State",es:"9. Dirección postal — Estado",ar:"٩. عنوان البريد — الولاية",fr:"9. Adresse postale — État",type:"text"},
      {id:"mail_zip",en:"9. Mailing Address — Zip Code",es:"9. Dirección postal — Código postal",ar:"٩. عنوان البريد — الرمز البريدي",fr:"9. Adresse postale — Code postal",type:"text"},
      {id:"sex",en:"10. Sex",es:"10. Sexo",ar:"١٠. الجنس",fr:"10. Sexe",type:"select",opts:SEX},
      {id:"marital",en:"11. Marital Status",es:"11. Estado civil",ar:"١١. الحالة الاجتماعية",fr:"11. État civil",type:"select",opts:MARITAL},
      {id:"dob",en:"12. Date of Birth (mm/dd/yyyy)",es:"12. Fecha de nacimiento (mm/dd/aaaa)",ar:"١٢. تاريخ الميلاد",fr:"12. Date de naissance (mm/jj/aaaa)",type:"date",req:true},
      {id:"city_birth",en:"13. City and Country of Birth",es:"13. Ciudad y país de nacimiento",ar:"١٣. مدينة وبلد الميلاد",fr:"13. Ville et pays de naissance",type:"text",req:true},
      {id:"nationality",en:"14. Present Nationality (Citizenship)",es:"14. Nacionalidad actual (ciudadanía)",ar:"١٤. الجنسية الحالية (المواطنة)",fr:"14. Nationalité actuelle (citoyenneté)",type:"text",req:true},
      {id:"nat_birth",en:"15. Nationality at Birth",es:"15. Nacionalidad al nacer",ar:"١٥. الجنسية عند الميلاد",fr:"15. Nationalité à la naissance",type:"text"},
      {id:"race",en:"16. Race, Ethnic, or Tribal Group",es:"16. Raza, grupo étnico o tribal",ar:"١٦. العرق أو المجموعة العرقية أو القبلية",fr:"16. Race, groupe ethnique ou tribal",type:"text"},
      {id:"religion",en:"17. Religion",es:"17. Religión",ar:"١٧. الدين",fr:"17. Religion",type:"text"},
      {id:"imm_court",en:"18. Immigration Court proceedings status",es:"18. Estado de procedimientos en tribunal de inmigración",ar:"١٨. حالة إجراءات محكمة الهجرة",fr:"18. Statut des procédures au tribunal d'immigration",type:"select",opts:COURT},
      {id:"last_left",en:"19a. When did you last leave your country? (mm/dd/yyyy)",es:"19a. ¿Cuándo salió por última vez de su país?",ar:"١٩أ. متى غادرت بلدك آخر مرة؟",fr:"19a. Quand avez-vous quitté votre pays pour la dernière fois?",type:"date"},
      {id:"i94",en:"19b. Current I-94 Number (if any)",es:"19b. Número I-94 actual (si tiene)",ar:"١٩ب. رقم I-94 الحالي (إن وجد)",fr:"19b. Numéro I-94 actuel (si applicable)",type:"text"},
      {id:"entry_instruction",en:"19c. List each entry into the U.S. beginning with your most recent entry. List date (mm/dd/yyyy), place, and your status for each entry. (Attach additional sheets as needed.)",es:"19c. Liste cada entrada a EE.UU. comenzando con la más reciente. Liste la fecha (mm/dd/aaaa), lugar y su estatus para cada entrada. (Adjunte hojas adicionales según sea necesario.)",ar:"١٩ج. أدرج كل دخول إلى الولايات المتحدة بدءاً من الأحدث. أدرج التاريخ والمكان وحالتك لكل دخول. (أرفق أوراقاً إضافية حسب الحاجة.)",fr:"19c. Listez chaque entrée aux États-Unis en commençant par la plus récente. Indiquez la date (mm/jj/aaaa), le lieu et votre statut pour chaque entrée. (Joindre des feuilles supplémentaires si nécessaire.)",type:"note"},
      {id:"e1_date",en:"19c. Entry 1 — Date (mm/dd/yyyy)",es:"19c. Entrada 1 — Fecha",ar:"١٩ج. الدخول ١ — التاريخ",fr:"19c. Entrée 1 — Date",type:"date"},
      {id:"e1_place",en:"19c. Entry 1 — Place",es:"19c. Entrada 1 — Lugar",ar:"١٩ج. الدخول ١ — المكان",fr:"19c. Entrée 1 — Lieu",type:"text"},
      {id:"e1_status",en:"19c. Entry 1 — Status",es:"19c. Entrada 1 — Estatus",ar:"١٩ج. الدخول ١ — الحالة",fr:"19c. Entrée 1 — Statut",type:"text"},
      {id:"e1_expires",en:"19c. Entry 1 — Date Status Expires (mm/dd/yyyy)",es:"19c. Entrada 1 — Fecha vencimiento del estatus",ar:"١٩ج. الدخول ١ — تاريخ انتهاء الحالة",fr:"19c. Entrée 1 — Date d'expiration du statut",type:"date"},
      {id:"e2_date",en:"19c. Entry 2 — Date (mm/dd/yyyy)",es:"19c. Entrada 2 — Fecha",ar:"١٩ج. الدخول ٢ — التاريخ",fr:"19c. Entrée 2 — Date",type:"date"},
      {id:"e2_place",en:"19c. Entry 2 — Place",es:"19c. Entrada 2 — Lugar",ar:"١٩ج. الدخول ٢ — المكان",fr:"19c. Entrée 2 — Lieu",type:"text"},
      {id:"e2_status",en:"19c. Entry 2 — Status",es:"19c. Entrada 2 — Estatus",ar:"١٩ج. الدخول ٢ — الحالة",fr:"19c. Entrée 2 — Statut",type:"text"},
      {id:"e3_date",en:"19c. Entry 3 — Date (mm/dd/yyyy)",es:"19c. Entrada 3 — Fecha",ar:"١٩ج. الدخول ٣ — التاريخ",fr:"19c. Entrée 3 — Date",type:"date"},
      {id:"e3_place",en:"19c. Entry 3 — Place",es:"19c. Entrada 3 — Lugar",ar:"١٩ج. الدخول ٣ — المكان",fr:"19c. Entrée 3 — Lieu",type:"text"},
      {id:"e3_status",en:"19c. Entry 3 — Status",es:"19c. Entrada 3 — Estatus",ar:"١٩ج. الدخول ٣ — الحالة",fr:"19c. Entrée 3 — Statut",type:"text"},
      {id:"passport_ctry",en:"20. Country that issued last passport or travel document",es:"20. País que emitió su último pasaporte o documento de viaje",ar:"٢٠. البلد الذي أصدر جواز سفرك الأخير أو وثيقة السفر",fr:"20. Pays ayant délivré votre dernier passeport ou document de voyage",type:"text"},
      {id:"passport_num",en:"21. Passport Number / Travel Document Number",es:"21. Número de pasaporte / Número de documento de viaje",ar:"٢١. رقم جواز السفر / رقم وثيقة السفر",fr:"21. Numéro de passeport / Document de voyage",type:"text"},
      {id:"passport_exp",en:"22. Expiration Date of Passport/Document (mm/dd/yyyy)",es:"22. Fecha de vencimiento del pasaporte/documento",ar:"٢٢. تاريخ انتهاء صلاحية جواز السفر/الوثيقة",fr:"22. Date d'expiration du passeport/document",type:"date"},
      {id:"native_lang",en:"23. Native language (include dialect, if applicable)",es:"23. Idioma nativo (incluir dialecto si aplica)",ar:"٢٣. اللغة الأم (بما في ذلك اللهجة إن وجدت)",fr:"23. Langue maternelle (inclure le dialecte si applicable)",type:"text"},
      {id:"fluent_en",en:"24. Are you fluent in English?",es:"24. ¿Habla inglés con fluidez?",ar:"٢٤. هل تتحدث الإنجليزية بطلاقة؟",fr:"24. Parlez-vous couramment l'anglais?",type:"yesno"},
      {id:"other_langs",en:"25. Other languages you speak fluently",es:"25. Otros idiomas que habla con fluidez",ar:"٢٥. لغات أخرى تتحدثها بطلاقة",fr:"25. Autres langues que vous parlez couramment",type:"text"},
    ]},
  { id:"aii_spouse",
    en:"Part A.II — Your Spouse", es:"Parte A.II — Su Cónyuge", ar:"الجزء أ.٢ — زوجك/زوجتك", fr:"Partie A.II — Votre Conjoint·e",
    short_en:"Part A.II — Spouse", short_es:"A.II — Cónyuge", short_ar:"أ.٢ — الزوج/ة", short_fr:"A.II — Conjoint·e",
    fields:[
      {id:"not_married",en:"Your Spouse — I am not married. (If checked, skip to Your Children below.)",es:"Su Cónyuge — No estoy casado/a. (Si marca, salte a la sección Sus Hijos/as.)",ar:"زوجك/زوجتك — لست متزوجاً/ة. (إن وضعت علامة، انتقل إلى قسم الأطفال.)",fr:"Votre Conjoint·e — Je ne suis pas marié·e. (Si coché, passer à la section Vos Enfants.)",type:"yesno"},
      {id:"sp_a_number",en:"Spouse — 1. Alien Registration Number (A-Number) (if any)",es:"Cónyuge — 1. Número de Registro de Extranjero (A-Number) (si tiene)",ar:"الزوج/ة — ١. رقم تسجيل الأجنبي (A-Number) (إن وجد)",fr:"Conjoint·e — 1. Numéro d'enregistrement étranger (A-Number) (si applicable)",type:"text"},
      {id:"sp_passport",en:"Spouse — 2. Passport/ID Card Number (if any)",es:"Cónyuge — 2. Número de pasaporte/ID (si tiene)",ar:"الزوج/ة — ٢. رقم جواز السفر/الهوية",fr:"Conjoint·e — 2. Numéro de passeport/ID",type:"text"},
      {id:"sp_dob",en:"Spouse — 3. Date of Birth (mm/dd/yyyy)",es:"Cónyuge — 3. Fecha de nacimiento",ar:"الزوج/ة — ٣. تاريخ الميلاد",fr:"Conjoint·e — 3. Date de naissance",type:"date"},
      {id:"sp_ssn",en:"Spouse — 4. U.S. Social Security Number (if any)",es:"Cónyuge — 4. Número de Seguro Social (si tiene)",ar:"الزوج/ة — ٤. رقم الضمان الاجتماعي",fr:"Conjoint·e — 4. Numéro de sécurité sociale US",type:"text"},
      {id:"sp_last",en:"Spouse — 5. Complete Last Name",es:"Cónyuge — 5. Apellido completo",ar:"الزوج/ة — ٥. اسم العائلة الكامل",fr:"Conjoint·e — 5. Nom de famille complet",type:"text"},
      {id:"sp_first",en:"Spouse — 6. First Name",es:"Cónyuge — 6. Nombre",ar:"الزوج/ة — ٦. الاسم الأول",fr:"Conjoint·e — 6. Prénom",type:"text"},
      {id:"sp_middle",en:"Spouse — 7. Middle Name",es:"Cónyuge — 7. Segundo nombre",ar:"الزوج/ة — ٧. الاسم الأوسط",fr:"Conjoint·e — 7. Deuxième prénom",type:"text"},
      {id:"sp_aliases",en:"Spouse — 8. Other names used (maiden name, aliases)",es:"Cónyuge — 8. Otros nombres usados (alias)",ar:"الزوج/ة — ٨. أسماء أخرى مستخدمة",fr:"Conjoint·e — 8. Autres noms utilisés (alias)",type:"text"},
      {id:"sp_marriage_date",en:"Spouse — 9. Date of Marriage (mm/dd/yyyy)",es:"Cónyuge — 9. Fecha de matrimonio",ar:"الزوج/ة — ٩. تاريخ الزواج",fr:"Conjoint·e — 9. Date de mariage",type:"date"},
      {id:"sp_marriage_place",en:"Spouse — 10. Place of Marriage",es:"Cónyuge — 10. Lugar del matrimonio",ar:"الزوج/ة — ١٠. مكان الزواج",fr:"Conjoint·e — 10. Lieu du mariage",type:"text"},
      {id:"sp_birth_city",en:"Spouse — 11. City and Country of Birth",es:"Cónyuge — 11. Ciudad y país de nacimiento",ar:"الزوج/ة — ١١. مدينة وبلد الميلاد",fr:"Conjoint·e — 11. Ville et pays de naissance",type:"text"},
      {id:"sp_nationality",en:"Spouse — 12. Nationality (Citizenship)",es:"Cónyuge — 12. Nacionalidad (ciudadanía)",ar:"الزوج/ة — ١٢. الجنسية (المواطنة)",fr:"Conjoint·e — 12. Nationalité (citoyenneté)",type:"text"},
      {id:"sp_race",en:"Spouse — 13. Race, Ethnic, or Tribal Group",es:"Cónyuge — 13. Raza, grupo étnico o tribal",ar:"الزوج/ة — ١٣. العرق أو المجموعة العرقية",fr:"Conjoint·e — 13. Race, groupe ethnique ou tribal",type:"text"},
      {id:"sp_sex",en:"Spouse — 14. Sex",es:"Cónyuge — 14. Sexo",ar:"الزوج/ة — ١٤. الجنس",fr:"Conjoint·e — 14. Sexe",type:"select",opts:SEX},
      {id:"sp_in_us",en:"Spouse — 15. Is this person in the U.S.? (If Yes, complete Blocks 16 to 24. If No, specify location below.)",es:"Cónyuge — 15. ¿Está esta persona en EE.UU.? (Si Sí, complete los Bloques 16 al 24. Si No, especifique la ubicación abajo.)",ar:"الزوج/ة — ١٥. هل هذا الشخص في الولايات المتحدة؟ (إن نعم، أكمل البنود ١٦-٢٤. إن لا، حدد الموقع أدناه.)",fr:"Conjoint·e — 15. Cette personne est-elle aux États-Unis? (Si Oui, compléter les cases 16 à 24. Si Non, préciser le lieu ci-dessous.)",type:"yesno"},
      {id:"sp_location_no",en:"Spouse — 15. If No — Specify location",es:"Cónyuge — 15. Si No — Especifique la ubicación",ar:"الزوج/ة — ١٥. إن لا — حدد الموقع",fr:"Conjoint·e — 15. Si Non — Préciser le lieu",type:"text"},
      {id:"sp_entry_place",en:"Spouse — 16. Place of last entry into the U.S.",es:"Cónyuge — 16. Lugar de última entrada a EE.UU.",ar:"الزوج/ة — ١٦. مكان آخر دخول لأمريكا",fr:"Conjoint·e — 16. Lieu de dernière entrée aux États-Unis",type:"text"},
      {id:"sp_entry_date",en:"Spouse — 17. Date of last entry into the U.S. (mm/dd/yyyy)",es:"Cónyuge — 17. Fecha de última entrada a EE.UU.",ar:"الزوج/ة — ١٧. تاريخ آخر دخول لأمريكا",fr:"Conjoint·e — 17. Date de dernière entrée aux États-Unis",type:"date"},
      {id:"sp_i94",en:"Spouse — 18. I-94 Number (if any)",es:"Cónyuge — 18. Número I-94 (si tiene)",ar:"الزوج/ة — ١٨. رقم I-94 (إن وجد)",fr:"Conjoint·e — 18. Numéro I-94 (si applicable)",type:"text"},
      {id:"sp_status_admit",en:"Spouse — 19. Status when last admitted (Visa type, if any)",es:"Cónyuge — 19. Estatus al ser admitido (tipo de visa)",ar:"الزوج/ة — ١٩. الحالة عند آخر دخول (نوع التأشيرة)",fr:"Conjoint·e — 19. Statut lors de la dernière admission (type de visa)",type:"text"},
      {id:"sp_cur_status",en:"Spouse — 20. Current immigration status",es:"Cónyuge — 20. Estatus migratorio actual",ar:"الزوج/ة — ٢٠. الحالة المهاجرية الحالية",fr:"Conjoint·e — 20. Statut d'immigration actuel",type:"text"},
      {id:"sp_status_exp",en:"Spouse — 21. Expiration date of authorized stay (mm/dd/yyyy)",es:"Cónyuge — 21. Fecha de vencimiento de estadía autorizada",ar:"الزوج/ة — ٢١. تاريخ انتهاء الإقامة المرخصة",fr:"Conjoint·e — 21. Date d'expiration du séjour autorisé",type:"date"},
      {id:"sp_court",en:"Spouse — 22. Is your spouse in Immigration Court proceedings?",es:"Cónyuge — 22. ¿Está su cónyuge en procedimientos de tribunal?",ar:"الزوج/ة — ٢٢. هل زوجك/زوجتك في إجراءات محكمة الهجرة؟",fr:"Conjoint·e — 22. Votre conjoint·e est-il/elle en procédure au tribunal?",type:"yesno"},
      {id:"sp_prev_arrival",en:"Spouse — 23. If previously in U.S., date of previous arrival (mm/dd/yyyy)",es:"Cónyuge — 23. Si estuvo antes en EE.UU., fecha de llegada anterior",ar:"الزوج/ة — ٢٣. إن كان في أمريكا من قبل، تاريخ الوصول السابق",fr:"Conjoint·e — 23. Si précédemment aux États-Unis, date d'arrivée précédente",type:"date"},
      {id:"sp_include",en:"Spouse — 24. Is your spouse to be included in this application?",es:"Cónyuge — 24. ¿Se incluirá al cónyuge en esta solicitud?",ar:"الزوج/ة — ٢٤. هل سيُضم الزوج/ة في هذا الطلب؟",fr:"Conjoint·e — 24. Le/la conjoint·e sera-t-il/elle inclus·e dans cette demande?",type:"yesno"},
    ]},
  { id:"aii_children",
    en:"Part A.II — Your Children", es:"Parte A.II — Sus Hijos/as", ar:"الجزء أ.٢ — أطفالك", fr:"Partie A.II — Vos Enfants",
    short_en:"Part A.II — Children", short_es:"A.II — Hijos/as", short_ar:"أ.٢ — الأطفال", short_fr:"A.II — Enfants",
    fields:[
      {id:"children_header",en:"Your Children. List all of your children, regardless of age, location, or marital status.",es:"Sus Hijos/as. Liste todos sus hijos/as, independientemente de su edad, ubicación o estado civil.",ar:"أطفالك. أدرج جميع أطفالك بغض النظر عن أعمارهم أو مواقعهم أو حالتهم الاجتماعية.",fr:"Vos Enfants. Listez tous vos enfants, quel que soit leur âge, lieu de résidence ou état civil.",type:"note"},
      {id:"no_children",en:"I do not have any children. (If checked Yes, skip to Part A.III, Information about your background.)",es:"No tengo hijos/as. (Si marca Sí, salte a la Parte A.III, Información sobre sus antecedentes.)",ar:"ليس لدي أطفال. (إن اخترت نعم، انتقل إلى الجزء أ.٣، معلومات عن خلفيتك.)",fr:"Je n'ai pas d'enfants. (Si Oui, passer à la Partie A.III, Informations sur votre parcours.)",type:"yesno"},
      {id:"children_note",en:"NOTE: Use Form I-589 Supplement A or attach additional sheets of paper and documentation if you have more than four children.",es:"NOTA: Use el Formulario I-589 Suplemento A o adjunte hojas adicionales si tiene más de cuatro hijos/as.",ar:"ملاحظة: استخدم النموذج I-589 الملحق أ أو أرفق أوراقاً إضافية إن كان لديك أكثر من أربعة أطفال.",fr:"NOTE: Utilisez le Formulaire I-589 Supplément A ou joignez des feuilles supplémentaires si vous avez plus de quatre enfants.",type:"note"},
      {id:"num_children",en:"Total number of children",es:"Número total de hijos/as",ar:"العدد الإجمالي للأطفال",fr:"Nombre total d'enfants",type:"text"},
      ...childFields(1),...childFields(2),...childFields(3),...childFields(4),
    ]},
  { id:"aiii",
    en:"Part A.III — Information About Your Background", es:"Parte A.III — Sus Antecedentes", ar:"الجزء أ.٣ — خلفيتك", fr:"Partie A.III — Votre Parcours",
    short_en:"Part A.III", short_es:"Parte A.III", short_ar:"أ.٣", short_fr:"Partie A.III",
    fields:[
      {id:"aiii_q1",en:"1. List your last address where you lived before coming to the United States. If this is not the country where you fear persecution, also list the last address in the country where you fear persecution. (List Address, City/Town, Department, Province, or State and Country.) (NOTE: Use Form I-589 Supplement B, or additional sheets of paper, if necessary.)",es:"1. Liste su última dirección donde vivió antes de venir a los Estados Unidos. Si este no es el país donde teme persecución, también liste la última dirección en el país donde teme persecución. (NOTA: Use el Formulario I-589 Suplemento B, u hojas adicionales, si es necesario.)",ar:"١. أدرج آخر عنوان سكنت فيه قبل القدوم إلى الولايات المتحدة. إن لم يكن هذا هو البلد الذي تخشى فيه الاضطهاد، أدرج أيضاً آخر عنوان في البلد الذي تخشى فيه الاضطهاد. (ملاحظة: استخدم النموذج I-589 الملحق ب، أو أوراقاً إضافية، إذا لزم الأمر.)",fr:"1. Listez votre dernière adresse avant de venir aux États-Unis. Si ce n'est pas le pays où vous craignez la persécution, listez aussi la dernière adresse dans ce pays. (NOTE: Utilisez le Formulaire I-589 Supplément B, ou des feuilles supplémentaires, si nécessaire.)",type:"note"},
      {id:"h1_street",en:"1. Last home country address — Row 1 — Number and Street (if available)",es:"1. Última dirección en país de origen — Fila 1 — Calle y número",ar:"١. آخر عنوان في البلد الأصلي — صف ١ — الشارع والرقم",fr:"1. Dernière adresse au pays — Rangée 1 — Numéro et rue",type:"text"},
      {id:"h1_city",en:"1. Last home country address — Row 1 — City/Town",es:"1. Última dirección — Fila 1 — Ciudad/Pueblo",ar:"١. آخر عنوان — صف ١ — المدينة/البلدة",fr:"1. Dernière adresse — Rangée 1 — Ville/Commune",type:"text"},
      {id:"h1_dept",en:"1. Last home country address — Row 1 — Department, Province, or State",es:"1. Última dirección — Fila 1 — Departamento, Provincia o Estado",ar:"١. آخر عنوان — صف ١ — المحافظة أو الإقليم أو الولاية",fr:"1. Dernière adresse — Rangée 1 — Département, Province ou État",type:"text"},
      {id:"h1_country",en:"1. Last home country address — Row 1 — Country",es:"1. Última dirección — Fila 1 — País",ar:"١. آخر عنوان — صف ١ — البلد",fr:"1. Dernière adresse — Rangée 1 — Pays",type:"text"},
      {id:"h1_from",en:"1. Last home country address — Row 1 — From (Mo/Yr)",es:"1. Última dirección — Fila 1 — Desde (Mes/Año)",ar:"١. آخر عنوان — صف ١ — من (شهر/سنة)",fr:"1. Dernière adresse — Rangée 1 — Depuis (Mois/An)",type:"text"},
      {id:"h1_to",en:"1. Last home country address — Row 1 — To (Mo/Yr)",es:"1. Última dirección — Fila 1 — Hasta (Mes/Año)",ar:"١. آخر عنوان — صف ١ — حتى (شهر/سنة)",fr:"1. Dernière adresse — Rangée 1 — Jusqu'à (Mois/An)",type:"text"},
      {id:"h2_street",en:"1. Last home country address — Row 2 — Number and Street",es:"1. Última dirección — Fila 2 — Calle y número",ar:"١. آخر عنوان — صف ٢ — الشارع والرقم",fr:"1. Dernière adresse — Rangée 2 — Numéro et rue",type:"text"},
      {id:"h2_city",en:"1. Last home country address — Row 2 — City/Town",es:"1. Última dirección — Fila 2 — Ciudad/Pueblo",ar:"١. آخر عنوان — صف ٢ — المدينة/البلدة",fr:"1. Dernière adresse — Rangée 2 — Ville/Commune",type:"text"},
      {id:"h2_dept",en:"1. Last home country address — Row 2 — Department, Province, or State",es:"1. Última dirección — Fila 2 — Departamento/Provincia/Estado",ar:"١. آخر عنوان — صف ٢ — المحافظة/الإقليم",fr:"1. Dernière adresse — Rangée 2 — Département/Province/État",type:"text"},
      {id:"h2_country",en:"1. Last home country address — Row 2 — Country",es:"1. Última dirección — Fila 2 — País",ar:"١. آخر عنوان — صف ٢ — البلد",fr:"1. Dernière adresse — Rangée 2 — Pays",type:"text"},
      {id:"h2_from",en:"1. Last home country address — Row 2 — From (Mo/Yr)",es:"1. Última dirección — Fila 2 — Desde",ar:"١. آخر عنوان — صف ٢ — من",fr:"1. Dernière adresse — Rangée 2 — Depuis",type:"text"},
      {id:"h2_to",en:"1. Last home country address — Row 2 — To (Mo/Yr)",es:"1. Última dirección — Fila 2 — Hasta",ar:"١. آخر عنوان — صف ٢ — حتى",fr:"1. Dernière adresse — Rangée 2 — Jusqu'à",type:"text"},
      ...resRow(1),...resRow(2),...resRow(3),...resRow(4),...resRow(5),
      ...eduRow(1),...eduRow(2),...eduRow(3),...eduRow(4),
      ...empRow(1),...empRow(2),...empRow(3),
      {id:"aiii_q5",en:"5. Provide the following information about your parents and siblings (brothers and sisters). Check the box if the person is deceased. (NOTE: Use Form I-589 Supplement B, or additional sheets of paper, if necessary.)",es:"5. Proporcione la siguiente información sobre sus padres y hermanos/as. Marque la casilla si la persona ha fallecido. (NOTA: Use el Formulario I-589 Suplemento B, u hojas adicionales, si es necesario.)",ar:"٥. قدم المعلومات التالية عن والديك وأشقائك (إخوة وأخوات). ضع علامة في المربع إن كان الشخص قد توفي. (ملاحظة: استخدم النموذج I-589 الملحق ب، أو أوراقاً إضافية، إذا لزم الأمر.)",fr:"5. Fournissez les informations suivantes sur vos parents et frères/sœurs. Cochez la case si la personne est décédée. (NOTE: Utilisez le Formulaire I-589 Supplément B, ou des feuilles supplémentaires, si nécessaire.)",type:"note"},
      {id:"mother_name",en:"5. Mother — Full Name",es:"5. Madre — Nombre completo",ar:"٥. الأم — الاسم الكامل",fr:"5. Mère — Nom complet",type:"text"},
      {id:"mother_birth",en:"5. Mother — City/Town and Country of Birth",es:"5. Madre — Ciudad y país de nacimiento",ar:"٥. الأم — مدينة وبلد الميلاد",fr:"5. Mère — Ville et pays de naissance",type:"text"},
      
      {id:"mother_deceased",en:"5. Mother — Deceased?",es:"5. Madre — ¿Fallecida?",ar:"٥. الأم — متوفاة؟",fr:"5. Mère — Décédée?",type:"yesno"},
      {id:"father_name",en:"5. Father — Full Name",es:"5. Padre — Nombre completo",ar:"٥. الأب — الاسم الكامل",fr:"5. Père — Nom complet",type:"text"},
      {id:"father_birth",en:"5. Father — City/Town and Country of Birth",es:"5. Padre — Ciudad y país de nacimiento",ar:"٥. الأب — مدينة وبلد الميلاد",fr:"5. Père — Ville et pays de naissance",type:"text"},
      
      {id:"father_deceased",en:"5. Father — Deceased?",es:"5. Padre — ¿Fallecido?",ar:"٥. الأب — متوفى؟",fr:"5. Père — Décédé?",type:"yesno"},
      ...sibFields(1),...sibFields(2),...sibFields(3),...sibFields(4),
    ]},
  { id:"b",
    en:"Part B — Information About Your Application", es:"Parte B — Información Sobre Su Solicitud", ar:"الجزء ب — معلومات عن طلبك", fr:"Partie B — Informations Sur Votre Demande",
    short_en:"Part B", short_es:"Parte B", short_ar:"الجزء ب", short_fr:"Partie B",
    fields:[
      {id:"b_note",en:"(NOTE: Use Form I-589 Supplement B, or attach additional sheets of paper as needed to complete your responses to the questions contained in Part B.)",es:"(NOTA: Use el Formulario I-589 Suplemento B, o adjunte hojas adicionales según sea necesario para completar sus respuestas a las preguntas contenidas en la Parte B.)",ar:"(ملاحظة: استخدم النموذج I-589 الملحق ب، أو أرفق أوراقاً إضافية حسب الحاجة لإكمال إجاباتك على الأسئلة الواردة في الجزء ب.)",fr:"(NOTE: Utilisez le Formulaire I-589 Supplément B, ou joignez des feuilles supplémentaires au besoin pour compléter vos réponses aux questions contenues dans la Partie B.)",type:"note"},
      {id:"b_intro",en:"When answering the following questions about your asylum or other protection claim (withholding of removal under 241(b)(3) of the INA or withholding of removal under the Convention Against Torture), you must provide a detailed and specific account of the basis of your claim to asylum or other protection. To the best of your ability, provide specific dates, places, and descriptions about each event or action described. You must attach documents evidencing the general conditions in the country from which you are seeking asylum or other protection and the specific facts on which you are relying to support your claim. If this documentation is unavailable or you are not providing this documentation with your application, explain why in your responses to the following questions.",es:"Al responder las siguientes preguntas sobre su solicitud de asilo u otra protección, debe proporcionar un relato detallado y específico de la base de su solicitud. En la medida de lo posible, proporcione fechas, lugares y descripciones específicas sobre cada evento o acción descrita. Debe adjuntar documentos que evidencien las condiciones generales en el país del cual solicita asilo y los hechos específicos en los que se basa para apoyar su solicitud.",ar:"عند الإجابة على الأسئلة التالية المتعلقة بطلب اللجوء أو الحماية الأخرى، يجب عليك تقديم سرد مفصل وتحديد أساس طلبك. بقدر ما تستطيع، قدم تواريخ وأماكن وأوصافاً محددة لكل حدث أو إجراء موصوف. يجب عليك إرفاق وثائق تُثبت الأوضاع العامة في البلد الذي تطلب منه اللجوء والحقائق المحددة التي تعتمد عليها.",fr:"En répondant aux questions suivantes sur votre demande d'asile ou autre protection, vous devez fournir un compte rendu détaillé et spécifique de la base de votre demande. Dans la mesure du possible, fournissez des dates, lieux et descriptions spécifiques pour chaque événement ou action décrit. Vous devez joindre des documents attestant des conditions générales dans le pays pour lequel vous demandez l'asile.",type:"note"},
      {id:"b_q1_intro",en:"1. Why are you applying for asylum or withholding of removal under section 241(b)(3) of the INA, or for withholding of removal under the Convention Against Torture? Check the appropriate box(es) below and then provide detailed answers to questions A and B below.",es:"1. ¿Por qué solicita asilo o la suspensión de deportación bajo la sección 241(b)(3) de la INA, o la suspensión de deportación bajo la Convención Contra la Tortura? Marque la(s) casilla(s) apropiada(s) a continuación y luego proporcione respuestas detalladas a las preguntas A y B.",ar:"١. لماذا تتقدم بطلب اللجوء أو تعليق الترحيل بموجب القسم ٢٤١(ب)(٣) من قانون الهجرة والجنسية، أو تعليق الترحيل بموجب اتفاقية مناهضة التعذيب؟ ضع علامة في الخانة/الخانات المناسبة أدناه ثم قدم إجابات مفصلة على السؤالين A وB.",fr:"1. Pourquoi demandez-vous l'asile ou la suspension d'expulsion en vertu de la section 241(b)(3) de la INA, ou la suspension d'expulsion en vertu de la Convention contre la Torture? Cochez la/les case(s) appropriée(s) ci-dessous et fournissez ensuite des réponses détaillées aux questions A et B.",type:"note"},
      {id:"basis_race",en:"1. Basis for claim — Race",es:"1. Motivo — Raza",ar:"١. أساس الطلب — العرق",fr:"1. Motif — Race",type:"yesno"},
      {id:"basis_religion",en:"1. Basis for claim — Religion",es:"1. Motivo — Religión",ar:"١. الأساس — الدين",fr:"1. Motif — Religion",type:"yesno"},
      {id:"basis_nationality",en:"1. Basis for claim — Nationality",es:"1. Motivo — Nacionalidad",ar:"١. الأساس — الجنسية",fr:"1. Motif — Nationalité",type:"yesno"},
      {id:"basis_political",en:"1. Basis for claim — Political opinion",es:"1. Motivo — Opinión política",ar:"١. الأساس — الرأي السياسي",fr:"1. Motif — Opinion politique",type:"yesno"},
      {id:"basis_social",en:"1. Basis for claim — Membership in a particular social group",es:"1. Motivo — Pertenencia a grupo social particular",ar:"١. الأساس — الانتماء لمجموعة اجتماعية معينة",fr:"1. Motif — Appartenance à un groupe social particulier",type:"yesno"},
      {id:"basis_torture",en:"1. Basis for claim — Torture Convention",es:"1. Motivo — Convención contra la Tortura",ar:"١. الأساس — اتفاقية مناهضة التعذيب",fr:"1. Motif — Convention contre la Torture",type:"yesno"},
      {id:"harm_past",en:"A. Have you, your family, or close friends or colleagues ever experienced harm or mistreatment or threats in the past by anyone?",es:"A. ¿Ha sufrido usted, su familia o amigos/colegas cercanos daño, maltrato o amenazas en el pasado por parte de alguien?",ar:"أ. هل عانيت أنت أو عائلتك أو أصدقاؤك/زملاؤك المقربون من أذى أو إساءة أو تهديدات في الماضي من أي شخص؟",fr:"A. Vous, votre famille ou vos amis/collègues proches avez-vous déjà subi des préjudices, mauvais traitements ou menaces dans le passé?",type:"yesno"},
      {id:"harm_past_detail",en:"A. If Yes — explain in detail: (1) What happened; (2) When the harm or mistreatment or threats occurred; (3) Who caused the harm or mistreatment or threats; and (4) Why you believe the harm or mistreatment or threats occurred.",es:"A. Si Sí — explique en detalle: (1) Qué pasó; (2) Cuándo ocurrió el daño, maltrato o amenazas; (3) Quién causó el daño, maltrato o amenazas; y (4) Por qué cree que ocurrió.",ar:"أ. إن نعم — اشرح بالتفصيل: (١) ما الذي حدث؛ (٢) متى حدث الأذى أو الإساءة أو التهديدات؛ (٣) من تسبب في ذلك؛ و(٤) لماذا تعتقد أن ذلك حدث.",fr:"A. Si Oui — expliquez en détail: (1) Ce qui s'est passé; (2) Quand le préjudice a eu lieu; (3) Qui en est responsable; et (4) Pourquoi vous pensez que cela s'est produit.",type:"textarea",tall:true},
      {id:"fear_future",en:"B. Do you fear harm or mistreatment if you return to your home country?",es:"B. ¿Teme sufrir daño o maltrato si regresa a su país de origen?",ar:"ب. هل تخشى تعرضك للأذى أو الإساءة إن عدت إلى بلدك؟",fr:"B. Craignez-vous des préjudices ou mauvais traitements si vous retournez dans votre pays d'origine?",type:"yesno"},
      {id:"fear_future_detail",en:"B. If Yes — explain in detail: (1) What harm or mistreatment you fear; (2) Who you believe would harm or mistreat you; and (3) Why you believe you would or could be harmed or mistreated.",es:"B. Si Sí — explique en detalle: (1) Qué daño o maltrato teme; (2) Quién cree que le haría daño; y (3) Por qué cree que podría ser dañado o maltratado.",ar:"ب. إن نعم — اشرح بالتفصيل: (١) ما الأذى الذي تخشاه؛ (٢) من تعتقد أنه سيؤذيك؛ و(٣) لماذا تعتقد أنك ستتعرض للأذى.",fr:"B. Si Oui — expliquez en détail: (1) Quel préjudice vous craignez; (2) Qui vous ferait du mal; et (3) Pourquoi vous pensez que vous pourriez être lésé.",type:"textarea",tall:true},
      {id:"arrested_outside",en:"2. Have you or your family members ever been accused, charged, arrested, detained, interrogated, convicted and sentenced, or imprisoned in any country other than the United States (including for an immigration law violation)?",es:"2. ¿Ha sido usted o su familia acusado, arrestado, detenido, interrogado, condenado o encarcelado en algún país fuera de EE.UU. (incluyendo violaciones de inmigración)?",ar:"٢. هل اتُّهمت أنت أو أفراد عائلتك أو اعتُقلتم أو احتُجزتم أو استُجوبتم أو أُدينتم أو سُجنتم في أي بلد غير الولايات المتحدة (بما في ذلك انتهاكات قانون الهجرة)؟",fr:"2. Vous ou des membres de votre famille avez-vous jamais été accusé, arrêté, détenu, interrogé, condamné ou emprisonné dans un pays autre que les États-Unis (y compris pour violations d'immigration)?",type:"yesno"},
      {id:"arrested_outside_detail",en:"2. If Yes — explain the circumstances and reasons for the action:",es:"2. Si Sí — explique las circunstancias y razones de la acción:",ar:"٢. إن نعم — اشرح الظروف وأسباب الإجراء:",fr:"2. Si Oui — expliquez les circonstances et les raisons:",type:"textarea",tall:true},
      {id:"orgs_belonged",en:"3A. Have you or your family members ever belonged to or been associated with any organizations or groups in your home country (such as a political party, student group, labor union, religious organization, military or paramilitary group, civil patrol, guerrilla organization, ethnic group, human rights group, or the press or media)?",es:"3A. ¿Ha pertenecido usted o su familia a alguna organización o grupo en su país de origen (como partido político, grupo estudiantil, sindicato, organización religiosa, grupo militar o paramilitar, patrulla civil, guerrilla, grupo étnico, derechos humanos o prensa/medios)?",ar:"٣أ. هل انتمى أنت أو أفراد عائلتك إلى أي منظمة أو مجموعة في بلدك الأصلي (مثل حزب سياسي، مجموعة طلابية، نقابة، منظمة دينية، مجموعة عسكرية أو شبه عسكرية، دورية مدنية، منظمة حقوق إنسان، صحافة/إعلام)؟",fr:"3A. Vous ou des membres de votre famille avez-vous jamais appartenu à des organisations ou groupes dans votre pays (comme un parti politique, syndicat, organisation religieuse, groupe militaire, organisation de droits de l'homme, presse/médias)?",type:"yesno"},
      {id:"orgs_belonged_detail",en:"3A. If Yes — describe for each person: the level of participation, any leadership or other positions held, and the length of time involved:",es:"3A. Si Sí — describa para cada persona: el nivel de participación, cargos de liderazgo, y el tiempo involucrado:",ar:"٣أ. إن نعم — صف لكل شخص: مستوى المشاركة والمناصب القيادية ومدة التورط:",fr:"3A. Si Oui — décrivez pour chaque personne: le niveau de participation, les postes de direction, et la durée d'implication:",type:"textarea",tall:true},
      {id:"orgs_continue",en:"3B. Do you or your family members continue to participate in any way in these organizations or groups?",es:"3B. ¿Continúa usted o su familia participando de alguna manera en estas organizaciones o grupos?",ar:"٣ب. هل تواصل أنت أو أفراد عائلتك المشاركة بأي شكل في هذه المنظمات أو المجموعات؟",fr:"3B. Vous ou des membres de votre famille continuez-vous à participer d'une quelconque manière à ces organisations ou groupes?",type:"yesno"},
      {id:"orgs_continue_detail",en:"3B. If Yes — describe for each person your or your family members' current level of participation, any leadership or other positions currently held, and the length of time you or your family members have been involved in each organization or group.",es:"3B. Si Sí — describa para cada persona el nivel actual de participación de usted o sus familiares, cualquier liderazgo u otros cargos actualmente ocupados, y el tiempo que usted o sus familiares han estado involucrados en cada organización o grupo.",ar:"٣ب. إن نعم — صف لكل شخص المستوى الحالي لمشاركة أنت أو أفراد عائلتك، وأي مناصب قيادية أو غيرها يشغلونها حالياً، والمدة التي شارك فيها أنت أو أفراد عائلتك في كل منظمة أو مجموعة.",fr:"3B. Si Oui — décrivez pour chaque personne le niveau actuel de participation de vous ou des membres de votre famille, tout poste de direction ou autre poste actuellement occupé, et la durée pendant laquelle vous ou les membres de votre famille avez été impliqués dans chaque organisation ou groupe.",type:"textarea"},
      {id:"torture_fear",en:"4. Are you afraid of being subjected to torture in your home country or any other country to which you may be returned?",es:"4. ¿Teme ser sometido a tortura en su país de origen o en cualquier otro país al que pueda ser devuelto?",ar:"٤. هل تخشى تعرضك للتعذيب في بلدك الأصلي أو أي بلد آخر قد تُرحل إليه؟",fr:"4. Craignez-vous d'être soumis à la torture dans votre pays d'origine ou dans tout autre pays vers lequel vous pourriez être renvoyé?",type:"yesno"},
      {id:"torture_fear_detail",en:"4. If Yes — explain why you are afraid and describe the nature of torture you fear, by whom, and why it would be inflicted:",es:"4. Si Sí — explique por qué teme la tortura, su naturaleza, quién la infligiría y por qué:",ar:"٤. إن نعم — اشرح لماذا تخشى التعذيب وطبيعته ومن سيوقعه ولماذا:",fr:"4. Si Oui — expliquez pourquoi vous craignez la torture, sa nature, par qui, et pourquoi elle serait infligée:",type:"textarea"},
    ]},
  { id:"c",
    en:"Part C — Additional Information About Your Application", es:"Parte C — Información Adicional Sobre Su Solicitud", ar:"الجزء ج — معلومات إضافية عن طلبك", fr:"Partie C — Informations Supplémentaires Sur Votre Demande",
    short_en:"Part C", short_es:"Parte C", short_ar:"الجزء ج", short_fr:"Partie C",
    fields:[
      {id:"prior_asylum",en:"1. Have you, your spouse, your child(ren), your parents or your siblings ever applied to the U.S. Government for refugee status, asylum, or withholding of removal?",es:"1. ¿Ha solicitado usted, su cónyuge, hijos, padres o hermanos al Gobierno de EE.UU. el estatus de refugiado, asilo o suspensión de deportación?",ar:"١. هل تقدمت أنت أو زوجك/زوجتك أو أطفالك أو والداك أو أشقاؤك بطلب للحكومة الأمريكية للحصول على وضع لاجئ أو لجوء أو تعليق الترحيل؟",fr:"1. Vous, votre conjoint·e, vos enfants, parents ou frères/sœurs avez-vous jamais demandé au gouvernement américain le statut de réfugié, l'asile ou la suspension d'expulsion?",type:"yesno"},
      {id:"prior_asylum_detail",en:"1. If Yes — explain the decision and what happened to any status you, your spouse, your child(ren), your parents, or your siblings received as a result of that decision. Indicate whether or not you were included in a parent or spouse's application. If so, include your parent or spouse's A-number in your response. If you have been denied asylum by an immigration judge or the Board of Immigration Appeals, describe any change(s) in conditions in your country or your own personal circumstances since the date of the denial that may affect your eligibility for asylum.",es:"1. Si Sí — explique la decisión y qué pasó con cualquier estatus que usted, su cónyuge, su(s) hijo(s), sus padres o hermanos recibieron como resultado de esa decisión. Indique si fue incluido o no en la solicitud de un padre o cónyuge. Si es así, incluya el número A de su padre o cónyuge en su respuesta. Si le han negado el asilo un juez de inmigración o la Junta de Apelaciones de Inmigración, describa cualquier cambio en las condiciones de su país o sus propias circunstancias personales desde la fecha de la denegación que pueda afectar su elegibilidad para el asilo.",ar:"١. إن نعم — اشرح القرار وما حدث لأي وضع قانوني حصل عليه أنت أو زوجك/زوجتك أو أطفالك أو والداك أو أشقاؤك نتيجة لذلك القرار. أشر إلى ما إذا كنت مشمولاً أم لا في طلب أحد الوالدين أو الزوج/الزوجة. إن كان الأمر كذلك، أدرج رقم A الخاص بوالدك أو زوجك/زوجتك في إجابتك. إن كان قد رُفض طلب لجوئك من قبل قاضي هجرة أو مجلس استئناف الهجرة، صف أي تغييرات في ظروف بلدك أو ظروفك الشخصية منذ تاريخ الرفض والتي قد تؤثر على أهليتك للحصول على اللجوء.",fr:"1. Si Oui — expliquez la décision et ce qui est arrivé à tout statut reçu par vous, votre conjoint·e, vos enfants, vos parents ou vos frères/sœurs. Indiquez si vous étiez inclus·e ou non dans la demande d'un parent ou conjoint·e. Si oui, incluez le numéro A de votre parent ou conjoint·e. Si l'asile vous a été refusé par un juge d'immigration ou le Conseil d'appel de l'immigration, décrivez tout changement de conditions dans votre pays ou de vos propres circonstances depuis la date du refus qui pourrait affecter votre éligibilité à l'asile.",type:"textarea",tall:true},es:"1. Si Sí — explique la decisión y qué pasó con el estatus recibido. Indique si fue incluido en la solicitud de un padre o cónyuge. Si fue negado por un juez de inmigración o la Junta de Apelaciones, describa cambios en las condiciones de su país o sus circunstancias personales desde la denegación:",ar:"١. إن نعم — اشرح القرار وما حدث لأي وضع قانوني مُنح. أشر إن كنت مشمولاً في طلب والد أو زوج. إن رُفض الطلب، صف أي تغييرات في ظروف بلدك أو ظروفك الشخصية:",fr:"1. Si Oui — expliquez la décision et ce qui est arrivé au statut reçu. Indiquez si vous étiez inclus dans la demande d'un parent ou conjoint. Si refusé, décrivez tout changement de conditions:",type:"textarea",tall:true},
      {id:"transit",en:"2A. After leaving the country from which you are claiming asylum, did you or your spouse or child(ren) who are now in the United States travel through or reside in any other country before entering the United States?",es:"2A. Después de salir del país del cual solicita asilo, ¿viajó usted, su cónyuge o hijos que están en EE.UU. a través de o residió en algún otro país antes de entrar a EE.UU.?",ar:"٢أ. بعد مغادرة البلد الذي تطلب منه اللجوء، هل سافرت أنت أو زوجك/زوجتك أو أطفالك الذين في أمريكا عبر أو أقمتم في أي بلد آخر قبل دخول الولايات المتحدة؟",fr:"2A. Après avoir quitté le pays pour lequel vous demandez l'asile, vous, votre conjoint·e ou vos enfants qui sont maintenant aux États-Unis avez-vous voyagé à travers ou résidé dans un autre pays avant d'entrer aux États-Unis?",type:"yesno"},
      {id:"other_status",en:"2B. Have you, your spouse, your child(ren), or other family members (such as your parents or siblings) ever applied for or received any lawful status in any country other than the one from which you are now claiming asylum?",es:"2B. ¿Ha solicitado usted, su cónyuge, hijos u otros familiares algún estatus legal en algún otro país distinto al del que solicita asilo?",ar:"٢ب. هل تقدم أنت أو زوجك/زوجتك أو أطفالك أو أفراد عائلتك الآخرون للحصول على وضع قانوني في أي بلد آخر غير البلد الذي تطلب منه اللجوء؟",fr:"2B. Vous, votre conjoint·e, vos enfants ou autres membres de votre famille avez-vous jamais demandé ou obtenu un statut légal dans un pays autre que celui pour lequel vous demandez l'asile?",type:"yesno"},
      {id:"transit_detail",en:"2A/2B. If Yes to either — for each person provide: the name of each country and the length of stay, the person's status while there, the reasons for leaving, whether the person is entitled to return for lawful residence purposes, and whether the person applied for refugee status or asylum while there, and if not, why not:",es:"2A/2B. Si Sí a alguna — para cada persona: nombre del país y duración de la estadía, estatus allí, razones para irse, si puede regresar para residencia legal, y si solicitó asilo allí, y si no, por qué no:",ar:"٢أ/٢ب. إن نعم لأي منهما — لكل شخص: اسم البلد ومدة الإقامة، الوضع القانوني هناك، أسباب المغادرة، ما إذا كان يحق له العودة للإقامة القانونية، وما إذا تقدم بطلب لجوء هناك:",fr:"2A/2B. Si Oui pour l'une ou l'autre — pour chaque personne: le nom de chaque pays et la durée du séjour, le statut là-bas, les raisons du départ, si la personne a le droit de retourner pour résidence légale, et si elle a demandé l'asile là-bas:",type:"textarea",tall:true},
      {id:"caused_harm",en:"3. Have you, your spouse or your child(ren) ever ordered, incited, assisted or otherwise participated in causing harm or suffering to any person because of his or her race, religion, nationality, membership in a particular social group or belief in a particular political opinion?",es:"3. ¿Ha ordenado, incitado, asistido o participado usted, su cónyuge o hijos en causar daño o sufrimiento a alguna persona por su raza, religión, nacionalidad, grupo social u opinión política?",ar:"٣. هل أصدرت أنت أو زوجك/زوجتك أو أطفالك أوامر بإلحاق الأذى بأي شخص أو حرّضتم على ذلك أو شاركتم فيه بسبب العرق أو الدين أو الجنسية أو المجموعة الاجتماعية أو الرأي السياسي؟",fr:"3. Vous, votre conjoint·e ou vos enfants avez-vous jamais ordonné, incité, aidé ou participé à causer des préjudices à une personne en raison de sa race, religion, nationalité, appartenance à un groupe social ou opinion politique?",type:"yesno"},
      {id:"caused_harm_detail",en:"3. If Yes — describe in detail each such incident and your own, your spouse's, or your child(ren)'s involvement:",es:"3. Si Sí — describa en detalle cada incidente y la participación de usted, su cónyuge o hijos:",ar:"٣. إن نعم — صف بالتفصيل كل حادثة ومشاركة أنت/زوجك/أطفالك فيها:",fr:"3. Si Oui — décrivez en détail chaque incident et l'implication de vous, votre conjoint·e ou vos enfants:",type:"textarea"},
      {id:"returned",en:"4. After you left the country where you were harmed or fear harm, did you return to that country?",es:"4. Después de salir del país donde fue dañado o teme ser dañado, ¿regresó a ese país?",ar:"٤. بعد مغادرة البلد حيث تعرضت للأذى أو تخشاه، هل عدت إلى ذلك البلد؟",fr:"4. Après avoir quitté le pays où vous avez été lésé ou craignez l'être, y êtes-vous retourné?",type:"yesno"},
      {id:"returned_detail",en:"4. If Yes — describe in detail the circumstances of your visit(s): the date(s) of the trip(s), the purpose(s) of the trip(s), and the length of time you remained in that country for the visit(s):",es:"4. Si Sí — describa las circunstancias de su(s) visita(s): fecha(s), propósito(s), y duración:",ar:"٤. إن نعم — صف بالتفصيل ظروف زيارتك: التاريخ والغرض ومدة بقائك في ذلك البلد:",fr:"4. Si Oui — décrivez en détail les circonstances de votre/vos visite(s): les dates, les objectifs, et la durée:",type:"textarea"},
      {id:"late_filing",en:"5. Are you filing this application more than 1 year after your last arrival in the United States?",es:"5. ¿Está presentando esta solicitud más de 1 año después de su última llegada a EE.UU.?",ar:"٥. هل تتقدم بهذا الطلب بعد أكثر من سنة من آخر وصول إلى الولايات المتحدة؟",fr:"5. Déposez-vous cette demande plus d'un an après votre dernière entrée aux États-Unis?",type:"yesno"},
      {id:"late_filing_detail",en:"5. If Yes — explain why you did not file within the first year after you arrived. You must be prepared to explain at your interview or hearing why you did not file your asylum application within the first year after you arrived. For guidance in answering this question, see Instructions, Part 1: Filing Instructions, Section V. \"Completing the Form,\" Part C.",es:"5. Si Sí — explique por qué no presentó la solicitud dentro del primer año después de llegar. Debe estar preparado para explicar en su entrevista o audiencia por qué no presentó su solicitud de asilo dentro del primer año después de llegar. Para orientación para responder esta pregunta, consulte las Instrucciones, Parte 1: Instrucciones para presentar, Sección V. \"Completar el formulario,\" Parte C.",ar:"٥. إن نعم — اشرح لماذا لم تتقدم خلال السنة الأولى بعد وصولك. يجب أن تكون مستعداً للتوضيح في مقابلتك أو جلسة الاستماع لماذا لم تتقدم بطلب اللجوء خلال السنة الأولى بعد وصولك. للتوجيه في الإجابة على هذا السؤال، راجع التعليمات، الجزء الأول: تعليمات التقديم، القسم الخامس. \"استكمال النموذج،\" الجزء ج.",fr:"5. Si Oui — expliquez pourquoi vous n'avez pas déposé dans la première année après votre arrivée. Vous devrez être prêt à expliquer lors de votre entretien ou audience pourquoi vous n'avez pas déposé votre demande d'asile dans la première année. Pour des conseils sur cette question, voir les Instructions, Partie 1: Instructions de dépôt, Section V. \"Compléter le formulaire,\" Partie C.",type:"textarea"},es:"5. Si Sí — explique por qué no presentó la solicitud dentro del primer año de llegada. Debe estar preparado para explicarlo en su entrevista o audiencia:",ar:"٥. إن نعم — اشرح لماذا لم تتقدم خلال السنة الأولى من وصولك. يجب أن تكون مستعداً للتوضيح في مقابلتك أو جلسة الاستماع:",fr:"5. Si Oui — expliquez pourquoi vous n'avez pas déposé dans la première année. Vous devrez être prêt à l'expliquer lors de votre entretien ou audience:",type:"textarea"},
      {id:"us_crimes",en:"6. Have you or any member of your family included in the application ever committed any crime and/or been arrested, charged, convicted, or sentenced for any crimes in the United States (including for an immigration law violation)?",es:"6. ¿Ha cometido usted o algún familiar incluido en esta solicitud algún delito o ha sido arrestado, acusado, condenado o sentenciado en EE.UU. (incluyendo violaciones de inmigración)?",ar:"٦. هل ارتكبت أنت أو أي فرد من عائلتك المدرج في هذا الطلب أي جريمة أو اعتُقل أو وُجِّهت إليه اتهامات أو أُدين أو صدر بحقه حكم في الولايات المتحدة؟",fr:"6. Vous ou tout membre de la famille inclus dans cette demande avez-vous jamais commis un crime et/ou été arrêté, inculpé, condamné aux États-Unis (y compris violations d'immigration)?",type:"yesno"},
      {id:"us_crimes_detail",en:"6. If Yes — for each instance, specify in your response: what occurred and the circumstances, dates, length of sentence received, location, the duration of the detention or imprisonment, reason(s) for the detention or conviction, any formal charges that were lodged against you or your relatives included in your application, and the reason(s) for release. Attach documents referring to these incidents, if they are available, or an explanation of why documents are not available.",es:"6. Si Sí — para cada instancia, especifique en su respuesta: qué ocurrió y las circunstancias, fechas, duración de la sentencia recibida, lugar, la duración de la detención o encarcelamiento, razón(es) de la detención o condena, cualquier cargo formal presentado contra usted o sus familiares incluidos en su solicitud, y la(s) razón(es) de la liberación. Adjunte documentos referentes a estos incidentes, si están disponibles, o una explicación de por qué no están disponibles los documentos.",ar:"٦. إن نعم — حدد في إجابتك لكل حالة: ما الذي حدث والظروف، والتواريخ، ومدة الحكم الصادر، والموقع، ومدة الاحتجاز أو السجن، وسبب/أسباب الاحتجاز أو الإدانة، وأي اتهامات رسمية وُجِّهت إليك أو إلى أقاربك المدرجين في طلبك، وسبب/أسباب الإفراج. أرفق وثائق تشير إلى هذه الحوادث إن كانت متاحة، أو تفسيراً لعدم توفر الوثائق.",fr:"6. Si Oui — pour chaque instance, précisez dans votre réponse: ce qui s'est passé et les circonstances, les dates, la durée de la peine reçue, le lieu, la durée de la détention ou de l'emprisonnement, la/les raison(s) de la détention ou de la condamnation, toute accusation formelle portée contre vous ou vos proches inclus dans votre demande, et la/les raison(s) de la libération. Joignez des documents se rapportant à ces incidents, s'ils sont disponibles, ou une explication des raisons pour lesquelles les documents ne sont pas disponibles.",type:"textarea",tall:true},es:"6. Si Sí — por cada instancia especifique: qué ocurrió y las circunstancias, fechas, duración de sentencia, lugar, duración de detención, razón de condena, cargos formales, y razón de liberación. Adjunte documentos si están disponibles:",ar:"٦. إن نعم — حدد لكل حادثة: ما الذي حدث والظروف، التواريخ، مدة الحكم، المكان، مدة الاحتجاز، سبب الإدانة، الاتهامات الرسمية، وسبب الإفراج. أرفق الوثائق إن توفرت:",fr:"6. Si Oui — pour chaque instance précisez: ce qui s'est passé et les circonstances, dates, durée de peine, lieu, durée de détention, raison de condamnation, charges formelles, et raison de libération. Joignez les documents si disponibles:",type:"textarea",tall:true},
    ]},
];

// ─── Translation ───────────────────────────────────────────────────────────
const cache: Record<string,string> = {};


async function toEnglish(text: string, srcLang: string): Promise<string> {
  if (!text?.trim() || srcLang==="en") return text;
  const k = `en::${text}`;
  if (cache[k]) return cache[k];
  const key = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
  if (!key) return text;
  try {
    const r = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${key}`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({q:text, source:srcLang, target:"en", format:"text"})
    });
    const d = await r.json();
    const result = d?.data?.translations?.[0]?.translatedText ?? text;
    cache[k] = result; return result;
  } catch { return text; }
}

function useDebounce(v: string, d: number) {
  const [val, setVal] = useState(v);
  useEffect(() => { const t = setTimeout(()=>setVal(v),d); return ()=>clearTimeout(t); }, [v,d]);
  return val;
}

// ─── Field component ───────────────────────────────────────────────────────
function FieldRow({field,lang,value,onValue,answeredIn,onAnsweredIn}: {
  field:Field; lang:Language; value:string;
  onValue:(v:string)=>void; answeredIn:string; onAnsweredIn:(lc:string)=>void;
}) {
  const [enTrans, setEnTrans] = useState("");
  const [loading, setLoading] = useState(false);
  const dv = useDebounce(value, 800);
  const isDate=field.type==="date", isSelect=field.type==="select", isYN=field.type==="yesno";
  const nativeLang=lang.code!=="en";
  const answeredNative=answeredIn===lang.code && nativeLang;
  const needsEnTrans=answeredNative && !isDate && !isSelect && !isYN && !!value?.trim();

  useEffect(() => {
    if (!dv?.trim() || !answeredNative || isDate || isSelect || isYN) { setEnTrans(""); return; }
    setLoading(true);
    toEnglish(dv, lang.code).then(t => { setEnTrans(t); setLoading(false); });
  }, [dv, answeredNative, isDate, isSelect, isYN, lang.code]);

  const lc = lang.code as "en"|"es"|"ar"|"fr";
  const label = field[lc] || field.en;
  const dir = lang.rtl ? "rtl" : "ltr";
  const inputS: React.CSSProperties = {
    width:"100%", padding:"10px 12px", border:`1.5px solid ${C.border}`,
    borderRadius:8, background:C.white, fontFamily:"inherit",
    fontSize:14, color:C.text, outline:"none", boxSizing:"border-box" as const,
    direction: lang.rtl && answeredNative ? "rtl" : "ltr",
  };

  if (field.type==="note") {
    return (
      <div style={{background:"#FFF9F0", border:`1px solid ${C.amberB}`, borderRadius:8, padding:"10px 14px", marginBottom:10, fontSize:13, color:"#555", lineHeight:1.6, direction:dir}}>
        {label}
      </div>
    );
  }

    return (
    <div style={{background:C.white, border:`1.5px solid ${C.border}`, borderRadius:10, padding:14, marginBottom:10}}>
      <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" as const, direction:dir}}>
        <span style={{fontSize:13, fontWeight:700, color:C.text}}>{label}</span>
        
        {needsEnTrans && (
          <span style={{fontSize:11, padding:"2px 8px", borderRadius:20, background:C.amberL, color:C.amber, fontWeight:600, border:`1px solid ${C.amberB}`}}>
            {UI.needs_trans[lang.code]}
          </span>
        )}
      </div>
      {isDate ? (
        <input type="date" value={value} onChange={e=>onValue(e.target.value)} style={{...inputS, direction:"ltr"}} />
      ) : isYN ? (
        <div style={{display:"flex", gap:10, direction:dir}}>
          {[["Yes","Sí","نعم","Oui"],["No","No","لا","Non"]].map(opts => {
            const idx = ["en","es","ar","fr"].indexOf(lang.code);
            const display = idx>=0 ? opts[idx] : opts[0];
            const enVal = opts[0];
            return (
              <button key={enVal} onClick={()=>onValue(value===enVal ? "" : enVal)} style={{
                padding:"8px 20px", borderRadius:20, cursor:"pointer", fontFamily:"inherit",
                fontSize:13, fontWeight:600,
                border: value===enVal ? `2px solid ${C.teal}` : `1.5px solid ${C.border}`,
                background: value===enVal ? C.teal : C.white,
                color: value===enVal ? C.white : C.mid,
              }}>{display}</button>
            );
          })}
        </div>
      ) : isSelect ? (
        <select value={value} onChange={e=>onValue(e.target.value)} style={{...inputS, cursor:"pointer"}}>
          <option value="">{UI.select[lang.code]}</option>
          {(field.opts||[]).map(row => {
            const idx = ["en","es","ar","fr"].indexOf(lang.code);
            const display = idx>=0 ? row[idx] : row[0];
            return <option key={row[0]} value={row[0]}>{display}</option>;
          })}
        </select>
      ) : field.type==="textarea" ? (
        <textarea value={value} onChange={e=>onValue(e.target.value)}
          style={{...inputS, resize:"vertical", lineHeight:1.6, minHeight:field.tall?140:72}}
          placeholder={UI.type_here[lang.code]} />
      ) : (
        <input type="text" value={value} onChange={e=>onValue(e.target.value)}
          style={inputS} placeholder={UI.type_here[lang.code]} />
      )}
      {!isDate && !isSelect && !isYN && nativeLang && (
        <div style={{display:"flex", gap:6, marginTop:10, alignItems:"center", direction:dir}}>
          <span style={{fontSize:11, color:C.light}}>{UI.answered_in[lang.code]}</span>
          {([lang.code,"en"] as string[]).map(lcode => (
            <button key={lcode} onClick={()=>onAnsweredIn(lcode)} style={{
              fontSize:12, padding:"5px 14px", borderRadius:20, cursor:"pointer",
              fontFamily:"inherit", fontWeight:600,
              border: answeredIn===lcode ? `2px solid ${C.teal}` : `1.5px solid ${C.border}`,
              background: answeredIn===lcode ? C.teal : C.white,
              color: answeredIn===lcode ? C.white : C.mid,
            }}>{lcode==="en" ? UI.in_english[lang.code] : lang.nativeLabel}</button>
          ))}
        </div>
      )}
      {needsEnTrans && (
        <div style={{marginTop:10, padding:"10px 12px", background:C.tealL, border:`1.5px solid ${C.tealB}`, borderRadius:8}}>
          <div style={{fontSize:11, fontWeight:700, color:C.teal, marginBottom:4, textTransform:"uppercase" as const, letterSpacing:"0.05em"}}>English</div>
          <div style={{fontSize:13, color:loading?C.light:C.text, fontStyle:loading?"italic":"normal", lineHeight:1.5}}>
            {loading ? UI.translating[lang.code] : enTrans || UI.trans_here[lang.code]}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Review screen ─────────────────────────────────────────────────────────
function ReviewScreen({formData,answeredIn,lang,onBack}:{
  formData:Record<string,string>; answeredIn:Record<string,string>; lang:Language; onBack:()=>void;
}) {
  const [enVals, setEnVals] = useState<Record<string,string>>({});
  const [busy, setBusy] = useState(true);
  

  useEffect(() => {
    const run = async () => {
      setBusy(true);
      const out: Record<string,string> = {};
      for (const sec of SECTIONS) {
        for (const f of sec.fields) {
          const v = formData[f.id];
          if (!v?.trim()) continue;
          const ans = answeredIn[f.id] || lang.code;
          if (ans===lang.code && lang.code!=="en" && f.type!=="date" && f.type!=="select" && f.type!=="yesno") {
            out[f.id] = await toEnglish(v, lang.code);
          } else { out[f.id] = v; }
        }
      }
      setEnVals(out); setBusy(false);
    };
    run();
  }, [formData, answeredIn, lang.code]);

  const lc = lang.code as "en"|"es"|"ar"|"fr";
  const dir = lang.rtl ? "rtl" : "ltr";

  const download = (english: boolean) => {
    const lc = lang.code as "en"|"es"|"ar"|"fr";
    const lines: string[] = [
      english ? "I-589 — English Version (for submission)" : `I-589 — ${lang.label} Version (for family review)`,
      "DRAFT — Not an official USCIS document",
      "",
    ];
    SECTIONS.forEach(sec => {
      const filled = sec.fields.filter(f => formData[f.id] && f.type!=="note");
      if (!filled.length) return;
      lines.push("=".repeat(60));
      lines.push(english ? sec.en : (sec[lc] || sec.en));
      lines.push("=".repeat(60));
      filled.forEach(f => {
        const label = english ? f.en : (f[lc] || f.en);
        const value = english ? (enVals[f.id] || formData[f.id]) : formData[f.id];
        lines.push(`${label}:`);
        lines.push(`  ${value}`);
        lines.push("");
      });
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = english ? "i589-english.txt" : `i589-${lang.code}.txt`;
    a.click();
  };

  return (
    <div style={{fontFamily:"system-ui,sans-serif", maxWidth:1100, margin:"0 auto", padding:"0 16px 6rem", color:C.text, direction:dir}}>
      <div style={{padding:"24px 0 20px", borderBottom:`3px solid ${C.teal}`, marginBottom:24}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap" as const, gap:12}}>
          <div>
            <div style={{fontSize:12, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.08em", color:C.teal, marginBottom:6}}>USCIS I-589</div>
            <div style={{fontSize:22, fontWeight:700}}>{UI.rev_title[lang.code]}</div>
            <div style={{fontSize:14, color:C.mid, marginTop:4}}>{UI.rev_desc[lang.code]}</div>
          </div>
          <button onClick={onBack} style={{padding:"10px 20px", borderRadius:8, border:`1.5px solid ${C.border}`, background:C.white, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:600, color:C.text}}>
            {UI.back[lang.code]}
          </button>
        </div>
      </div>
      {busy && <div style={{background:C.tealL, border:`1.5px solid ${C.tealB}`, borderRadius:10, padding:"14px 18px", marginBottom:20, fontSize:14, color:C.teal, fontWeight:600}}>{UI.translating[lang.code]}</div>}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:12}}>
        <div style={{fontSize:12, fontWeight:700, textTransform:"uppercase" as const, color:C.teal}}>{UI.your_lang[lang.code]} — {lang.nativeLabel}</div>
        <div style={{fontSize:12, fontWeight:700, textTransform:"uppercase" as const, color:C.mid}}>{UI.english_ver[lang.code]}</div>
      </div>
      {SECTIONS.map(sec => {
        const filled = sec.fields.filter(f=>formData[f.id]);
        if (!filled.length) return null;
        return (
          <div key={sec.id} style={{marginBottom:28}}>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:8}}>
              <div style={{fontSize:14, fontWeight:700, padding:"10px 14px", background:C.gray, borderRadius:8, borderLeft:lang.rtl?"none":`4px solid ${C.teal}`, borderRight:lang.rtl?`4px solid ${C.teal}`:"none"}}>{sec[lc]||sec.en}</div>
              <div style={{fontSize:14, fontWeight:700, padding:"10px 14px", background:C.gray, borderRadius:8, borderLeft:`4px solid ${C.tealB}`}}>{sec.en}</div>
            </div>
            {filled.map(f => (
              <div key={f.id} style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:8}}>
                <div style={{background:C.tealL, border:`1.5px solid ${C.tealB}`, borderRadius:10, padding:14, direction:dir}}>
                  <div style={{fontSize:11, fontWeight:700, color:C.teal, textTransform:"uppercase" as const, letterSpacing:"0.05em", marginBottom:6}}>{f[lc]||f.en}</div>
                  <div style={{padding:"8px 10px", background:C.white, borderRadius:8, border:`1.5px solid ${C.tealB}`, fontSize:14, color:C.text, lineHeight:1.5, minHeight:38, direction:dir, whiteSpace:"pre-wrap" as const}}>{formData[f.id]}</div>
                </div>
                <div style={{background:C.white, border:`1.5px solid ${C.border}`, borderRadius:10, padding:14}}>
                  <div style={{fontSize:11, fontWeight:700, color:C.mid, textTransform:"uppercase" as const, letterSpacing:"0.05em", marginBottom:6}}>{f.en}</div>
                  <div style={{padding:"8px 10px", background:C.gray, borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:14, color:busy?C.light:C.text, lineHeight:1.5, minHeight:38, fontStyle:busy?"italic":"normal", whiteSpace:"pre-wrap" as const}}>
                    {busy ? UI.translating[lang.code] : (enVals[f.id]||formData[f.id])}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{position:"sticky", bottom:0, background:C.white, borderTop:`2px solid ${C.border}`, padding:"16px 0", display:"flex", gap:12, flexWrap:"wrap" as const}}>
        <button onClick={()=>download(false)} style={{flex:1, minWidth:200, padding:"13px", borderRadius:8, background:C.teal, color:C.white, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700}}>
          {UI.dl_nat[lang.code]}
        </button>
        <button onClick={()=>download(true)} style={{flex:1, minWidth:200, padding:"13px", borderRadius:8, background:C.white, color:C.teal, border:`2px solid ${C.teal}`, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700}}>
          {UI.dl_en[lang.code]}
        </button>
      </div>
    </div>
  );
}

// ─── Language picker ────────────────────────────────────────────────────────
function LangPicker({onSelect}:{onSelect:(l:Language)=>void}) {
  const [hov, setHov] = useState<string|null>(null);
  return (
    <div style={{fontFamily:"system-ui,sans-serif", minHeight:400, display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", padding:"3rem 16px", color:C.text}}>
      <div style={{fontSize:12, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.1em", color:C.teal, marginBottom:12}}>USCIS Form I-589</div>
      <div style={{fontSize:26, fontWeight:700, marginBottom:10, textAlign:"center" as const}}>Asylum Application Helper</div>
      <div style={{fontSize:15, color:C.mid, marginBottom:36, textAlign:"center" as const, maxWidth:480, lineHeight:1.6}}>
        Choose your language · Elige tu idioma · اختر لغتك · Choisissez votre langue
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, width:"100%", maxWidth:440}}>
        {LANGS.map(l => (
          <button key={l.code} onClick={()=>onSelect(l)}
            onMouseOver={()=>setHov(l.code)} onMouseOut={()=>setHov(null)}
            style={{padding:"20px", borderRadius:12, cursor:"pointer", fontFamily:"inherit",
              border: hov===l.code ? `2px solid ${C.teal}` : `2px solid ${C.border}`,
              background: hov===l.code ? C.tealL : C.white,
              display:"flex", flexDirection:"column" as const, alignItems:"center", gap:6, transition:"all 0.15s"}}>
            <span style={{fontSize:30}}>{l.flag}</span>
            <span style={{fontSize:16, fontWeight:700}}>{l.nativeLabel}</span>
            <span style={{fontSize:13, color:C.mid}}>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main app ───────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState<Language|null>(null);
  const [secIdx, setSecIdx] = useState(0);
  const [formData, setFormData] = useState<Record<string,string>>({});
  const [answeredIn, setAnsweredIn] = useState<Record<string,string>>({});
  const [showReview, setShowReview] = useState(false);

  if (!lang) return <LangPicker onSelect={setLang} />;
  if (showReview) return <ReviewScreen formData={formData} answeredIn={answeredIn} lang={lang} onBack={()=>setShowReview(false)} />;

  const sec = SECTIONS[secIdx];
  const lc = lang.code as "en"|"es"|"ar"|"fr";
  const dir = lang.rtl ? "rtl" : "ltr";
  const filled = Object.values(formData).filter(v=>v?.trim()).length;
  const shortKey = `short_${lc}` as keyof Section;

  return (
    <div style={{fontFamily:"system-ui,sans-serif", maxWidth:700, margin:"0 auto", padding:"0 16px 4rem", color:C.text, direction:dir}}>
      <div style={{padding:"24px 0 20px", borderBottom:`3px solid ${C.teal}`, marginBottom:24}}>
        <div style={{fontSize:12, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.08em", color:C.teal, marginBottom:6}}>{UI.subtitle[lang.code]}</div>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" as const}}>
          <div>
            <div style={{fontSize:22, fontWeight:700, marginBottom:4}}>{UI.title[lang.code]}</div>
            <div style={{fontSize:13, color:C.mid}}>{UI.desc[lang.code]}</div>
          </div>
          <div style={{display:"flex", flexDirection:"column" as const, alignItems:"flex-end", gap:6}}>
            {filled>0 && <div style={{fontSize:12, color:C.mid}}>{filled} {UI.filled[lang.code]}</div>}
            <button onClick={()=>setShowReview(true)} style={{padding:"10px 20px", borderRadius:8, background:C.teal, color:C.white, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700}}>
              {UI.review[lang.code]}
            </button>
          </div>
        </div>
      </div>
      <div style={{display:"flex", gap:8, alignItems:"center", marginBottom:20, flexWrap:"wrap" as const}}>
        {LANGS.map(l => (
          <button key={l.code} onClick={()=>setLang(l)} style={{
            padding:"6px 14px", borderRadius:20, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:600,
            border: lang.code===l.code ? `2px solid ${C.teal}` : `1.5px solid ${C.border}`,
            background: lang.code===l.code ? C.teal : C.white,
            color: lang.code===l.code ? C.white : C.mid,
          }}>{l.flag} {l.nativeLabel}</button>
        ))}
      </div>
      <div style={{display:"flex", gap:6, flexWrap:"wrap" as const, marginBottom:20}}>
        {SECTIONS.map((s,i) => (
          <button key={s.id} onClick={()=>setSecIdx(i)} style={{
            padding:"8px 14px", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700,
            border: secIdx===i ? `2px solid ${C.teal}` : `1.5px solid ${C.border}`,
            background: secIdx===i ? C.teal : C.white,
            color: secIdx===i ? C.white : C.mid,
          }}>{s[shortKey] as string || s.short_en}</button>
        ))}
      </div>
      <div style={{fontSize:14, fontWeight:700, color:C.text, marginBottom:16, padding:"12px 16px", background:C.gray, borderRadius:8, borderLeft:lang.rtl?"none":`4px solid ${C.teal}`, borderRight:lang.rtl?`4px solid ${C.teal}`:"none"}}>
        {sec[lc]||sec.en}
      </div>
      {sec.fields.map(f => (
        <FieldRow key={f.id} field={f} lang={lang}
          value={formData[f.id]||""}
          onValue={v=>setFormData(p=>({...p,[f.id]:v}))}
          answeredIn={answeredIn[f.id]||lang.code}
          onAnsweredIn={lcode=>setAnsweredIn(p=>({...p,[f.id]:lcode}))}
        />
      ))}
      <div style={{display:"flex", justifyContent:"space-between", marginTop:24, paddingTop:20, borderTop:`1.5px solid ${C.border}`}}>
        <button onClick={()=>setSecIdx(i=>Math.max(0,i-1))} disabled={secIdx===0}
          style={{padding:"10px 22px", borderRadius:8, border:`1.5px solid ${C.border}`, background:secIdx===0?C.gray:C.white, color:secIdx===0?C.light:C.text, cursor:secIdx===0?"default":"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700}}>
          {UI.prev[lang.code]}
        </button>
        {secIdx<SECTIONS.length-1 ? (
          <button onClick={()=>setSecIdx(i=>Math.min(SECTIONS.length-1,i+1))}
            style={{padding:"10px 22px", borderRadius:8, background:C.teal, color:C.white, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700}}>
            {UI.next[lang.code]}
          </button>
        ) : (
          <button onClick={()=>setShowReview(true)}
            style={{padding:"10px 22px", borderRadius:8, background:C.teal, color:C.white, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700}}>
            {UI.review[lang.code]}
          </button>
        )}
      </div>
    </div>
  );
}

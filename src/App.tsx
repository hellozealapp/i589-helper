import { useState, useEffect } from "react";

interface Language { code: string; label: string; nativeLabel: string; rtl: boolean; flag: string; }
interface Field { id: string; labelKey: string; type: "text" | "date" | "select" | "textarea"; required?: boolean; optionKeys?: string[]; hintKey?: string; tall?: boolean; }
interface Section { id: string; titleKey: string; shortKey: string; fields: Field[]; }

const LANGUAGES: Language[] = [
  { code: "en", label: "English", nativeLabel: "English", rtl: false, flag: "🇺🇸" },
  { code: "es", label: "Spanish", nativeLabel: "Español", rtl: false, flag: "🇪🇸" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", rtl: true, flag: "🇸🇦" },
  { code: "fr", label: "French", nativeLabel: "Français", rtl: false, flag: "🇫🇷" },
];

const C = {
  teal: "#0F6E56", tealLight: "#E1F5EE", tealBorder: "#5DCAA5",
  amber: "#BA7517", amberLight: "#FAEEDA", amberBorder: "#EF9F27",
  gray: "#F7F7F5", border: "#D3D1C7",
  white: "#FFFFFF", text: "#1a1a1a", textMid: "#555", textLight: "#999",
  danger: "#E24B4A",
};

type StringMap = Record<string, Record<string, string>>;

const STRINGS: StringMap = {
  app_title:        { en: "Asylum Application Helper", es: "Asistente de Solicitud de Asilo", ar: "مساعد طلب اللجوء", fr: "Assistant de Demande d'Asile" },
  app_subtitle:     { en: "USCIS Form I-589", es: "Formulario USCIS I-589", ar: "نموذج USCIS I-589", fr: "Formulaire USCIS I-589" },
  app_desc:         { en: "Fill out each section. At the end you'll see both versions — one in your language, one in English — to review and export.", es: "Complete cada sección. Al final verá ambas versiones — una en su idioma y otra en inglés — para revisar y exportar.", ar: "أكمل كل قسم. في النهاية ستعرض نسختين — واحدة بلغتك وأخرى بالإنجليزية — للمراجعة والتصدير.", fr: "Remplissez chaque section. À la fin vous verrez les deux versions — une dans votre langue, une en anglais — pour réviser et exporter." },
  choose_language:  { en: "Choose your language", es: "Elige tu idioma", ar: "اختر لغتك", fr: "Choisissez votre langue" },
  answered_in:      { en: "I answered in:", es: "Respondí en:", ar: "أجبت بـ:", fr: "J'ai répondu en:" },
  in_english:       { en: "English", es: "Inglés", ar: "الإنجليزية", fr: "Anglais" },
  type_here:        { en: "Type here…", es: "Escriba aquí…", ar: "اكتب هنا…", fr: "Écrivez ici…" },
  select_option:    { en: "— Select —", es: "— Seleccione —", ar: "— اختر —", fr: "— Sélectionner —" },
  previous:         { en: "← Previous", es: "← Anterior", ar: "→ السابق", fr: "← Précédent" },
  next:             { en: "Next →", es: "Siguiente →", ar: "← التالي", fr: "Suivant →" },
  review_export:    { en: "Review & Export →", es: "Revisar y Exportar →", ar: "مراجعة وتصدير ←", fr: "Réviser et Exporter →" },
  translating:      { en: "Translating…", es: "Traduciendo…", ar: "جارٍ الترجمة…", fr: "Traduction en cours…" },
  translation_here: { en: "Translation will appear here", es: "La traducción aparecerá aquí", ar: "ستظهر الترجمة هنا", fr: "La traduction apparaîtra ici" },
  needs_en_trans:   { en: "⚠ needs English translation", es: "⚠ necesita traducción al inglés", ar: "⚠ يحتاج ترجمة إنجليزية", fr: "⚠ nécessite traduction anglaise" },
  for_submission:   { en: "English — for submission", es: "Inglés — para presentar", ar: "الإنجليزية — للتقديم", fr: "Anglais — pour soumission" },
  for_review:       { en: "Your language — for review", es: "Tu idioma — para revisar", ar: "لغتك — للمراجعة", fr: "Votre langue — pour révision" },
  fields_filled:    { en: "fields filled", es: "campos completados", ar: "حقول مكتملة", fr: "champs remplis" },
  review_title:     { en: "Review your application", es: "Revise su solicitud", ar: "راجع طلبك", fr: "Révisez votre demande" },
  review_desc:      { en: "Check both versions below. When ready, export both files.", es: "Revise ambas versiones. Cuando esté listo, exporte ambos archivos.", ar: "راجع كلتا النسختين. عند الاستعداد، صدّر كلا الملفين.", fr: "Vérifiez les deux versions. Quand vous êtes prêt, exportez les deux fichiers." },
  needs_trans_warn: { en: "fields answered in your language need English translation before submission", es: "campos respondidos en su idioma necesitan traducción al inglés antes de presentar", ar: "حقول بلغتك تحتاج ترجمة إنجليزية قبل التقديم", fr: "champs répondus dans votre langue nécessitent traduction anglaise avant soumission" },
  back_to_form:     { en: "← Back to form", es: "← Volver al formulario", ar: "→ العودة للنموذج", fr: "← Retour au formulaire" },
  dl_english:       { en: "↓ Download English version", es: "↓ Descargar versión en inglés", ar: "↓ تحميل النسخة الإنجليزية", fr: "↓ Télécharger la version anglaise" },
  dl_native:        { en: "↓ Download your language version", es: "↓ Descargar versión en español", ar: "↓ تحميل النسخة العربية", fr: "↓ Télécharger la version française" },
  sec_about_title:  { en: "Part A.I — About You", es: "Parte A.I — Sobre Usted", ar: "الجزء أ.١ — معلوماتك", fr: "Partie A.I — À Votre Sujet" },
  sec_about_short:  { en: "About You", es: "Sobre Usted", ar: "عنك", fr: "À Votre Sujet" },
  sec_family_title: { en: "Part A.II — Your Family", es: "Parte A.II — Su Familia", ar: "الجزء أ.٢ — عائلتك", fr: "Partie A.II — Votre Famille" },
  sec_family_short: { en: "Family", es: "Familia", ar: "العائلة", fr: "Famille" },
  sec_bg_title:     { en: "Part A.III — Your Background", es: "Parte A.III — Sus Antecedentes", ar: "الجزء أ.٣ — خلفيتك", fr: "Partie A.III — Votre Parcours" },
  sec_bg_short:     { en: "Background", es: "Antecedentes", ar: "الخلفية", fr: "Parcours" },
  sec_claim_title:  { en: "Part B — Your Asylum Claim", es: "Parte B — Su Solicitud de Asilo", ar: "الجزء ب — طلب لجوئك", fr: "Partie B — Votre Demande d'Asile" },
  sec_claim_short:  { en: "Claim", es: "Solicitud", ar: "الطلب", fr: "Demande" },
  sec_add_title:    { en: "Part C — Additional Information", es: "Parte C — Información Adicional", ar: "الجزء ج — معلومات إضافية", fr: "Partie C — Informations Supplémentaires" },
  sec_add_short:    { en: "Additional", es: "Adicional", ar: "إضافي", fr: "Supplémentaire" },
  f_last_name:      { en: "Last name", es: "Apellido", ar: "اسم العائلة", fr: "Nom de famille" },
  f_first_name:     { en: "First name", es: "Nombre", ar: "الاسم الأول", fr: "Prénom" },
  f_middle_name:    { en: "Middle name", es: "Segundo nombre", ar: "الاسم الأوسط", fr: "Deuxième prénom" },
  f_aliases:        { en: "Other names used (aliases)", es: "Otros nombres usados (alias)", ar: "أسماء أخرى (أسماء مستعارة)", fr: "Autres noms utilisés (alias)" },
  f_dob:            { en: "Date of birth", es: "Fecha de nacimiento", ar: "تاريخ الميلاد", fr: "Date de naissance" },
  f_city_birth:     { en: "City/town of birth", es: "Ciudad/pueblo de nacimiento", ar: "مدينة/بلدة الميلاد", fr: "Ville de naissance" },
  f_country_birth:  { en: "Country of birth", es: "País de nacimiento", ar: "بلد الميلاد", fr: "Pays de naissance" },
  f_nationality:    { en: "Current nationality/citizenship", es: "Nacionalidad/ciudadanía actual", ar: "الجنسية الحالية", fr: "Nationalité actuelle" },
  f_race:           { en: "Race, ethnic, or tribal group", es: "Raza, grupo étnico o tribal", ar: "العرق أو المجموعة العرقية", fr: "Race, groupe ethnique ou tribal" },
  f_religion:       { en: "Religion", es: "Religión", ar: "الدين", fr: "Religion" },
  f_sex:            { en: "Sex", es: "Sexo", ar: "الجنس", fr: "Sexe" },
  f_marital:        { en: "Marital status", es: "Estado civil", ar: "الحالة الاجتماعية", fr: "État civil" },
  f_spouse_last:    { en: "Spouse — last name", es: "Cónyuge — apellido", ar: "الزوج/ة — اسم العائلة", fr: "Conjoint·e — nom" },
  f_spouse_first:   { en: "Spouse — first name", es: "Cónyuge — nombre", ar: "الزوج/ة — الاسم الأول", fr: "Conjoint·e — prénom" },
  f_spouse_dob:     { en: "Spouse — date of birth", es: "Cónyuge — fecha de nacimiento", ar: "الزوج/ة — تاريخ الميلاد", fr: "Conjoint·e — date de naissance" },
  f_spouse_nat:     { en: "Spouse — nationality", es: "Cónyuge — nacionalidad", ar: "الزوج/ة — الجنسية", fr: "Conjoint·e — nationalité" },
  f_spouse_us:      { en: "Is spouse in the U.S.?", es: "¿Está el cónyuge en EE.UU.?", ar: "هل الزوج/ة في الولايات المتحدة؟", fr: "Le/la conjoint·e est-il/elle aux États-Unis?" },
  f_child1_last:    { en: "Child 1 — last name", es: "Hijo/a 1 — apellido", ar: "الطفل ١ — اسم العائلة", fr: "Enfant 1 — nom" },
  f_child1_first:   { en: "Child 1 — first name", es: "Hijo/a 1 — nombre", ar: "الطفل ١ — الاسم الأول", fr: "Enfant 1 — prénom" },
  f_child1_dob:     { en: "Child 1 — date of birth", es: "Hijo/a 1 — fecha de nacimiento", ar: "الطفل ١ — تاريخ الميلاد", fr: "Enfant 1 — date de naissance" },
  f_child1_nat:     { en: "Child 1 — nationality", es: "Hijo/a 1 — nacionalidad", ar: "الطفل ١ — الجنسية", fr: "Enfant 1 — nationalité" },
  f_child1_us:      { en: "Child 1 — in the U.S.?", es: "Hijo/a 1 — ¿en EE.UU.?", ar: "الطفل ١ — في الولايات المتحدة؟", fr: "Enfant 1 — aux États-Unis?" },
  f_child2_last:    { en: "Child 2 — last name", es: "Hijo/a 2 — apellido", ar: "الطفل ٢ — اسم العائلة", fr: "Enfant 2 — nom" },
  f_child2_first:   { en: "Child 2 — first name", es: "Hijo/a 2 — nombre", ar: "الطفل ٢ — الاسم الأول", fr: "Enfant 2 — prénom" },
  f_child2_dob:     { en: "Child 2 — date of birth", es: "Hijo/a 2 — fecha de nacimiento", ar: "الطفل ٢ — تاريخ الميلاد", fr: "Enfant 2 — date de naissance" },
  f_child2_nat:     { en: "Child 2 — nationality", es: "Hijo/a 2 — nacionalidad", ar: "الطفل ٢ — الجنسية", fr: "Enfant 2 — nationalité" },
  f_child2_us:      { en: "Child 2 — in the U.S.?", es: "Hijo/a 2 — ¿en EE.UU.?", ar: "الطفل ٢ — في الولايات المتحدة؟", fr: "Enfant 2 — aux États-Unis?" },
  f_sib1_last:      { en: "Sibling 1 — last name", es: "Hermano/a 1 — apellido", ar: "الأخ/الأخت ١ — اسم العائلة", fr: "Frère/Sœur 1 — nom" },
  f_sib1_first:     { en: "Sibling 1 — first name", es: "Hermano/a 1 — nombre", ar: "الأخ/الأخت ١ — الاسم الأول", fr: "Frère/Sœur 1 — prénom" },
  f_sib1_dob:       { en: "Sibling 1 — date of birth", es: "Hermano/a 1 — fecha de nacimiento", ar: "الأخ/الأخت ١ — تاريخ الميلاد", fr: "Frère/Sœur 1 — date de naissance" },
  f_sib1_nat:       { en: "Sibling 1 — nationality", es: "Hermano/a 1 — nacionalidad", ar: "الأخ/الأخت ١ — الجنسية", fr: "Frère/Sœur 1 — nationalité" },
  f_sib1_loc:       { en: "Sibling 1 — current country", es: "Hermano/a 1 — país actual", ar: "الأخ/الأخت ١ — البلد الحالي", fr: "Frère/Sœur 1 — pays actuel" },
  f_sib2_last:      { en: "Sibling 2 — last name", es: "Hermano/a 2 — apellido", ar: "الأخ/الأخت ٢ — اسم العائلة", fr: "Frère/Sœur 2 — nom" },
  f_sib2_first:     { en: "Sibling 2 — first name", es: "Hermano/a 2 — nombre", ar: "الأخ/الأخت ٢ — الاسم الأول", fr: "Frère/Sœur 2 — prénom" },
  f_sib2_dob:       { en: "Sibling 2 — date of birth", es: "Hermano/a 2 — fecha de nacimiento", ar: "الأخ/الأخت ٢ — تاريخ الميلاد", fr: "Frère/Sœur 2 — date de naissance" },
  f_sib2_nat:       { en: "Sibling 2 — nationality", es: "Hermano/a 2 — nacionalidad", ar: "الأخ/الأخت ٢ — الجنسية", fr: "Frère/Sœur 2 — nationalité" },
  f_sib2_loc:       { en: "Sibling 2 — current country", es: "Hermano/a 2 — país actual", ar: "الأخ/الأخت ٢ — البلد الحالي", fr: "Frère/Sœur 2 — pays actuel" },
  f_curr_addr:      { en: "Current address in the U.S.", es: "Dirección actual en EE.UU.", ar: "العنوان الحالي في الولايات المتحدة", fr: "Adresse actuelle aux États-Unis" },
  f_home_addr:      { en: "Last address in home country", es: "Última dirección en su país de origen", ar: "آخر عنوان في بلدك الأصلي", fr: "Dernière adresse dans votre pays d'origine" },
  f_education:      { en: "Highest level of education", es: "Nivel más alto de educación", ar: "أعلى مستوى تعليمي", fr: "Niveau d'éducation le plus élevé" },
  f_occupation:     { en: "Current occupation", es: "Ocupación actual", ar: "المهنة الحالية", fr: "Profession actuelle" },
  f_prev_addr1:     { en: "Previous address 1", es: "Dirección anterior 1", ar: "العنوان السابق ١", fr: "Adresse précédente 1" },
  f_prev_addr1_from:{ en: "Previous address 1 — from", es: "Dirección anterior 1 — desde", ar: "العنوان السابق ١ — من", fr: "Adresse précédente 1 — depuis" },
  f_prev_addr1_to:  { en: "Previous address 1 — to", es: "Dirección anterior 1 — hasta", ar: "العنوان السابق ١ — حتى", fr: "Adresse précédente 1 — jusqu'à" },
  f_prev_addr2:     { en: "Previous address 2", es: "Dirección anterior 2", ar: "العنوان السابق ٢", fr: "Adresse précédente 2" },
  f_prev_addr2_from:{ en: "Previous address 2 — from", es: "Dirección anterior 2 — desde", ar: "العنوان السابق ٢ — من", fr: "Adresse précédente 2 — depuis" },
  f_prev_addr2_to:  { en: "Previous address 2 — to", es: "Dirección anterior 2 — hasta", ar: "العنوان السابق ٢ — حتى", fr: "Adresse précédente 2 — jusqu'à" },
  f_basis_race:     { en: "Basis: Race", es: "Motivo: Raza", ar: "الأساس: العرق", fr: "Motif: Race" },
  f_basis_religion: { en: "Basis: Religion", es: "Motivo: Religión", ar: "الأساس: الدين", fr: "Motif: Religion" },
  f_basis_nat:      { en: "Basis: Nationality", es: "Motivo: Nacionalidad", ar: "الأساس: الجنسية", fr: "Motif: Nationalité" },
  f_basis_political:{ en: "Basis: Political opinion", es: "Motivo: Opinión política", ar: "الأساس: الرأي السياسي", fr: "Motif: Opinion politique" },
  f_basis_social:   { en: "Basis: Membership in a particular social group", es: "Motivo: Pertenencia a un grupo social", ar: "الأساس: الانتماء لمجموعة اجتماعية", fr: "Motif: Appartenance à un groupe social particulier" },
  f_persecution:    { en: "Describe the harm you suffered or fear", es: "Describa el daño que sufrió o teme", ar: "صف الأذى الذي عانيت منه أو تخشاه", fr: "Décrivez le préjudice que vous avez subi ou craignez" },
  f_persecution_hint:{ en: "Include: who harmed you or who you fear, what happened, when and where, and why (race, religion, nationality, political opinion, or social group).", es: "Incluya: quién le dañó o a quién teme, qué pasó, cuándo y dónde, y por qué (raza, religión, nacionalidad, opinión política o grupo social).", ar: "أذكر: من آذاك أو من تخشاه، ماذا حدث، متى وأين، ولماذا (العرق، الدين، الجنسية، الرأي السياسي، أو المجموعة الاجتماعية).", fr: "Incluez: qui vous a nui, ce qui s'est passé, quand et où, et pourquoi (race, religion, nationalité, opinion politique ou groupe social)." },
  f_harm_govt:      { en: "Were you or your family harmed by your home government?", es: "¿Usted o su familia fue dañada por su gobierno?", ar: "هل تعرضت أنت أو عائلتك للأذى من حكومة بلدك؟", fr: "Vous ou votre famille avez-vous été lésé par votre gouvernement?" },
  f_harm_others:    { en: "Were you or your family harmed by non-government groups?", es: "¿Usted o su familia fue dañada por grupos no gubernamentales?", ar: "هل تعرضت أنت أو عائلتك للأذى من جهات غير حكومية؟", fr: "Vous ou votre famille avez-vous été lésé par des groupes non gouvernementaux?" },
  f_no_protection:  { en: "If harmed by non-government groups — why couldn't your government protect you?", es: "Si fue dañado por grupos no gubernamentales — ¿por qué su gobierno no pudo protegerle?", ar: "إن تعرضت للأذى من جهات غير حكومية — لماذا لم تستطع حكومتك حمايتك؟", fr: "Si lésé par des groupes non gouvernementaux — pourquoi votre gouvernement n'a-t-il pas pu vous protéger?" },
  f_relocate:       { en: "Could you safely relocate within your home country?", es: "¿Podría reubicarse de forma segura dentro de su país?", ar: "هل كان بإمكانك الانتقال بأمان داخل بلدك؟", fr: "Pourriez-vous vous réinstaller en sécurité dans votre pays?" },
  f_no_relocate:    { en: "If no — explain why you could not relocate", es: "Si no — explique por qué no pudo reubicarse", ar: "إن لا — اشرح لماذا لم تستطع الانتقال", fr: "Si non — expliquez pourquoi vous ne pouviez pas vous réinstaller" },
  f_prior_asylum:   { en: "Have you or your family ever applied for asylum before?", es: "¿Usted o su familia ha solicitado asilo antes?", ar: "هل تقدمت أنت أو عائلتك بطلب لجوء من قبل؟", fr: "Vous ou votre famille avez-vous déjà demandé l'asile?" },
  f_prior_details:  { en: "If yes — provide details (country, outcome, date)", es: "Si sí — proporcione detalles (país, resultado, fecha)", ar: "إن نعم — قدم التفاصيل (البلد، النتيجة، التاريخ)", fr: "Si oui — fournir des détails (pays, résultat, date)" },
  f_arrested:       { en: "Have you or your family ever been arrested or convicted in any country?", es: "¿Usted o su familia ha sido arrestada o condenada en algún país?", ar: "هل اعتُقلت أنت أو عائلتك أو صدر بحقكم حكم إدانة؟", fr: "Vous ou votre famille avez-vous été arrêté ou condamné?" },
  f_arrested_det:   { en: "If yes — explain circumstances", es: "Si sí — explique las circunstancias", ar: "إن نعم — اشرح الظروف", fr: "Si oui — expliquez les circonstances" },
  f_orgs:           { en: "Have you or your family been members of any political party, military, or organization?", es: "¿Usted o su familia ha sido miembro de algún partido político, militar u organización?", ar: "هل انتمى أنت أو عائلتك إلى أي حزب سياسي أو جيش أو منظمة؟", fr: "Vous ou votre famille avez-vous été membres d'un parti politique ou d'une organisation?" },
  f_orgs_det:       { en: "If yes — describe the organization and your role", es: "Si sí — describa la organización y su papel", ar: "إن نعم — صف المنظمة ودورك فيها", fr: "Si oui — décrivez l'organisation et votre rôle" },
  f_imm_status:     { en: "Current immigration status in the U.S.", es: "Estado migratorio actual en EE.UU.", ar: "وضعك الهجري الحالي في الولايات المتحدة", fr: "Statut d'immigration actuel aux États-Unis" },
  f_entry_date:     { en: "Date of last entry into the U.S.", es: "Fecha de última entrada a EE.UU.", ar: "تاريخ آخر دخول إلى الولايات المتحدة", fr: "Date de dernière entrée aux États-Unis" },
  f_port_entry:     { en: "Port of entry (city / state / airport)", es: "Puerto de entrada (ciudad / estado / aeropuerto)", ar: "منفذ الدخول (المدينة / الولاية / المطار)", fr: "Point d'entrée (ville / état / aéroport)" },
  opt_male:         { en: "Male", es: "Masculino", ar: "ذكر", fr: "Homme" },
  opt_female:       { en: "Female", es: "Femenino", ar: "أنثى", fr: "Femme" },
  opt_single:       { en: "Single", es: "Soltero/a", ar: "أعزب/عزباء", fr: "Célibataire" },
  opt_married:      { en: "Married", es: "Casado/a", ar: "متزوج/ة", fr: "Marié·e" },
  opt_divorced:     { en: "Divorced", es: "Divorciado/a", ar: "مطلق/ة", fr: "Divorcé·e" },
  opt_widowed:      { en: "Widowed", es: "Viudo/a", ar: "أرمل/ة", fr: "Veuf/Veuve" },
  opt_separated:    { en: "Separated", es: "Separado/a", ar: "منفصل/ة", fr: "Séparé·e" },
  opt_yes:          { en: "Yes", es: "Sí", ar: "نعم", fr: "Oui" },
  opt_no:           { en: "No", es: "No", ar: "لا", fr: "Non" },
  opt_na:           { en: "N/A", es: "N/A", ar: "لا ينطبق", fr: "N/A" },
  opt_edu_none:     { en: "None", es: "Ninguno", ar: "لا شيء", fr: "Aucun" },
  opt_edu_some_pri: { en: "Some primary", es: "Primaria incompleta", ar: "بعض التعليم الابتدائي", fr: "Primaire partiel" },
  opt_edu_pri:      { en: "Primary complete", es: "Primaria completa", ar: "تعليم ابتدائي كامل", fr: "Primaire complet" },
  opt_edu_some_sec: { en: "Some secondary", es: "Secundaria incompleta", ar: "بعض التعليم الثانوي", fr: "Secondaire partiel" },
  opt_edu_sec:      { en: "Secondary complete", es: "Secundaria completa", ar: "تعليم ثانوي كامل", fr: "Secondaire complet" },
  opt_edu_some_uni: { en: "Some university", es: "Universidad incompleta", ar: "بعض التعليم الجامعي", fr: "Université partielle" },
  opt_edu_uni:      { en: "University degree", es: "Título universitario", ar: "شهادة جامعية", fr: "Diplôme universitaire" },
  opt_edu_grad:     { en: "Graduate/professional degree", es: "Posgrado/título profesional", ar: "درجة الدراسات العليا", fr: "Diplôme de master/professionnel" },
  opt_no_status:    { en: "No status", es: "Sin estatus", ar: "بدون وضع قانوني", fr: "Sans statut" },
  opt_visa_exp:     { en: "Visa (expired)", es: "Visa (vencida)", ar: "تأشيرة (منتهية)", fr: "Visa (expiré)" },
  opt_visa_val:     { en: "Visa (valid)", es: "Visa (vigente)", ar: "تأشيرة (سارية)", fr: "Visa (valide)" },
  opt_parolee:      { en: "Parolee", es: "Libertad condicional", ar: "إفراج مشروط", fr: "Libéré conditionnellement" },
  opt_other:        { en: "Other", es: "Otro", ar: "أخرى", fr: "Autre" },
};

const SECTIONS: Section[] = [
  {
    id: "applicant", titleKey: "sec_about_title", shortKey: "sec_about_short",
    fields: [
      { id: "last_name", labelKey: "f_last_name", type: "text", required: true },
      { id: "first_name", labelKey: "f_first_name", type: "text", required: true },
      { id: "middle_name", labelKey: "f_middle_name", type: "text" },
      { id: "aliases", labelKey: "f_aliases", type: "text" },
      { id: "dob", labelKey: "f_dob", type: "date", required: true },
      { id: "city_birth", labelKey: "f_city_birth", type: "text", required: true },
      { id: "country_birth", labelKey: "f_country_birth", type: "text", required: true },
      { id: "nationality", labelKey: "f_nationality", type: "text", required: true },
      { id: "race", labelKey: "f_race", type: "text" },
      { id: "religion", labelKey: "f_religion", type: "text" },
      { id: "sex", labelKey: "f_sex", type: "select", optionKeys: ["opt_male", "opt_female"] },
      { id: "marital", labelKey: "f_marital", type: "select", optionKeys: ["opt_single", "opt_married", "opt_divorced", "opt_widowed", "opt_separated"] },
    ],
  },
  {
    id: "family", titleKey: "sec_family_title", shortKey: "sec_family_short",
    fields: [
      { id: "spouse_last", labelKey: "f_spouse_last", type: "text" },
      { id: "spouse_first", labelKey: "f_spouse_first", type: "text" },
      { id: "spouse_dob", labelKey: "f_spouse_dob", type: "date" },
      { id: "spouse_nat", labelKey: "f_spouse_nat", type: "text" },
      { id: "spouse_us", labelKey: "f_spouse_us", type: "select", optionKeys: ["opt_yes", "opt_no", "opt_na"] },
      { id: "child1_last", labelKey: "f_child1_last", type: "text" },
      { id: "child1_first", labelKey: "f_child1_first", type: "text" },
      { id: "child1_dob", labelKey: "f_child1_dob", type: "date" },
      { id: "child1_nat", labelKey: "f_child1_nat", type: "text" },
      { id: "child1_us", labelKey: "f_child1_us", type: "select", optionKeys: ["opt_yes", "opt_no", "opt_na"] },
      { id: "child2_last", labelKey: "f_child2_last", type: "text" },
      { id: "child2_first", labelKey: "f_child2_first", type: "text" },
      { id: "child2_dob", labelKey: "f_child2_dob", type: "date" },
      { id: "child2_nat", labelKey: "f_child2_nat", type: "text" },
      { id: "child2_us", labelKey: "f_child2_us", type: "select", optionKeys: ["opt_yes", "opt_no", "opt_na"] },
      { id: "sib1_last", labelKey: "f_sib1_last", type: "text" },
      { id: "sib1_first", labelKey: "f_sib1_first", type: "text" },
      { id: "sib1_dob", labelKey: "f_sib1_dob", type: "date" },
      { id: "sib1_nat", labelKey: "f_sib1_nat", type: "text" },
      { id: "sib1_loc", labelKey: "f_sib1_loc", type: "text" },
      { id: "sib2_last", labelKey: "f_sib2_last", type: "text" },
      { id: "sib2_first", labelKey: "f_sib2_first", type: "text" },
      { id: "sib2_dob", labelKey: "f_sib2_dob", type: "date" },
      { id: "sib2_nat", labelKey: "f_sib2_nat", type: "text" },
      { id: "sib2_loc", labelKey: "f_sib2_loc", type: "text" },
    ],
  },
  {
    id: "background", titleKey: "sec_bg_title", shortKey: "sec_bg_short",
    fields: [
      { id: "curr_addr", labelKey: "f_curr_addr", type: "textarea" },
      { id: "home_addr", labelKey: "f_home_addr", type: "textarea" },
      { id: "education", labelKey: "f_education", type: "select", optionKeys: ["opt_edu_none","opt_edu_some_pri","opt_edu_pri","opt_edu_some_sec","opt_edu_sec","opt_edu_some_uni","opt_edu_uni","opt_edu_grad"] },
      { id: "occupation", labelKey: "f_occupation", type: "text" },
      { id: "prev_addr1", labelKey: "f_prev_addr1", type: "textarea" },
      { id: "prev_addr1_from", labelKey: "f_prev_addr1_from", type: "date" },
      { id: "prev_addr1_to", labelKey: "f_prev_addr1_to", type: "date" },
      { id: "prev_addr2", labelKey: "f_prev_addr2", type: "textarea" },
      { id: "prev_addr2_from", labelKey: "f_prev_addr2_from", type: "date" },
      { id: "prev_addr2_to", labelKey: "f_prev_addr2_to", type: "date" },
    ],
  },
  {
    id: "claim", titleKey: "sec_claim_title", shortKey: "sec_claim_short",
    fields: [
      { id: "basis_race", labelKey: "f_basis_race", type: "select", optionKeys: ["opt_yes","opt_no"] },
      { id: "basis_religion", labelKey: "f_basis_religion", type: "select", optionKeys: ["opt_yes","opt_no"] },
      { id: "basis_nat", labelKey: "f_basis_nat", type: "select", optionKeys: ["opt_yes","opt_no"] },
      { id: "basis_political", labelKey: "f_basis_political", type: "select", optionKeys: ["opt_yes","opt_no"] },
      { id: "basis_social", labelKey: "f_basis_social", type: "select", optionKeys: ["opt_yes","opt_no"] },
      { id: "persecution", labelKey: "f_persecution", type: "textarea", tall: true, hintKey: "f_persecution_hint" },
      { id: "harm_govt", labelKey: "f_harm_govt", type: "select", optionKeys: ["opt_yes","opt_no"] },
      { id: "harm_others", labelKey: "f_harm_others", type: "select", optionKeys: ["opt_yes","opt_no"] },
      { id: "no_protection", labelKey: "f_no_protection", type: "textarea" },
      { id: "relocate", labelKey: "f_relocate", type: "select", optionKeys: ["opt_yes","opt_no"] },
      { id: "no_relocate", labelKey: "f_no_relocate", type: "textarea" },
    ],
  },
  {
    id: "additional", titleKey: "sec_add_title", shortKey: "sec_add_short",
    fields: [
      { id: "prior_asylum", labelKey: "f_prior_asylum", type: "select", optionKeys: ["opt_yes","opt_no"] },
      { id: "prior_details", labelKey: "f_prior_details", type: "textarea" },
      { id: "arrested", labelKey: "f_arrested", type: "select", optionKeys: ["opt_yes","opt_no"] },
      { id: "arrested_det", labelKey: "f_arrested_det", type: "textarea" },
      { id: "orgs", labelKey: "f_orgs", type: "select", optionKeys: ["opt_yes","opt_no"] },
      { id: "orgs_det", labelKey: "f_orgs_det", type: "textarea" },
      { id: "imm_status", labelKey: "f_imm_status", type: "select", optionKeys: ["opt_no_status","opt_visa_exp","opt_visa_val","opt_parolee","opt_other"] },
      { id: "entry_date", labelKey: "f_entry_date", type: "date" },
      { id: "port_entry", labelKey: "f_port_entry", type: "text" },
    ],
  },
];

// ─── Translation (Google Translate v2) ────────────────────────────
const cache: Record<string, string> = {};

function s(key: string, lang: string): string {
  return STRINGS[key]?.[lang] ?? STRINGS[key]?.["en"] ?? key;
}

async function googleTranslate(text: string, targetLang: string): Promise<string> {
  if (!text?.trim() || targetLang === "en") return text;
  const cacheKey = `${targetLang}::${text}`;
  if (cache[cacheKey]) return cache[cacheKey];
  const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) return text;
  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, target: targetLang, format: "text" }),
      }
    );
    const data = await res.json();
    const result: string = data?.data?.translations?.[0]?.translatedText ?? text;
    cache[cacheKey] = result;
    return result;
  } catch { return text; }
}

async function translateToEnglish(text: string, sourceLang: string): Promise<string> {
  if (!text?.trim() || sourceLang === "en") return text;
  const cacheKey = `en::${text}`;
  if (cache[cacheKey]) return cache[cacheKey];
  const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) return text;
  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, source: sourceLang, target: "en", format: "text" }),
      }
    );
    const data = await res.json();
    const result: string = data?.data?.translations?.[0]?.translatedText ?? text;
    cache[cacheKey] = result;
    return result;
  } catch { return text; }
}

function useDebounce(value: string, delay: number): string {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
}

// ─── Field Row ─────────────────────────────────────────────────────
interface FieldRowProps {
  field: Field; lang: Language;
  value: string; onValueChange: (v: string) => void;
  answeredIn: string; onAnsweredInChange: (lc: string) => void;
}

function FieldRow({ field, lang, value, onValueChange, answeredIn, onAnsweredInChange }: FieldRowProps) {
  const [enTranslation, setEnTranslation] = useState("");
  const [translating, setTranslating] = useState(false);
  const debouncedValue = useDebounce(value, 800);
  const isDate = field.type === "date";
  const isSelect = field.type === "select";
  const answeredInNative = answeredIn === lang.code && lang.code !== "en";
  const needsEnTranslation = answeredInNative && !isDate && !isSelect && !!value?.trim();

  useEffect(() => {
    if (!debouncedValue?.trim() || !answeredInNative || isDate || isSelect) { setEnTranslation(""); return; }
    setTranslating(true);
    translateToEnglish(debouncedValue, lang.code).then(t => { setEnTranslation(t); setTranslating(false); });
  }, [debouncedValue, answeredInNative, isDate, isSelect, lang.code]);

  const inputBox: React.CSSProperties = {
    width: "100%", padding: "10px 12px",
    border: `1.5px solid ${C.border}`, borderRadius: 8,
    background: C.white, fontFamily: "inherit",
    fontSize: 14, color: C.text, outline: "none",
    boxSizing: "border-box" as const,
    direction: lang.rtl && answeredInNative ? "rtl" : "ltr",
  };

  return (
    <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" as const, direction: lang.rtl ? "rtl" : "ltr" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s(field.labelKey, lang.code)}</span>
        {field.required && <span style={{ fontSize: 13, color: C.danger, fontWeight: 700 }}>*</span>}
        {needsEnTranslation && (
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.amberLight, color: C.amber, fontWeight: 600, border: `1px solid ${C.amberBorder}` }}>
            {s("needs_en_trans", lang.code)}
          </span>
        )}
      </div>

      {field.hintKey && (
        <div style={{ fontSize: 12, color: C.textMid, marginBottom: 10, lineHeight: 1.5, fontStyle: "italic", padding: "6px 10px", background: C.gray, borderRadius: 6, direction: lang.rtl ? "rtl" : "ltr" }}>
          {s(field.hintKey, lang.code)}
        </div>
      )}

      {isDate ? (
        <input type="date" value={value} onChange={e => onValueChange(e.target.value)} style={{ ...inputBox, direction: "ltr" }} />
      ) : isSelect ? (
        <select value={value} onChange={e => onValueChange(e.target.value)} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">{s("select_option", lang.code)}</option>
          {field.optionKeys?.map(ok => (
            <option key={ok} value={s(ok, "en")}>{s(ok, lang.code)}</option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea value={value} onChange={e => onValueChange(e.target.value)}
          style={{ ...inputBox, resize: "vertical", lineHeight: 1.6, minHeight: field.tall ? 130 : 64 }}
          placeholder={s("type_here", lang.code)} />
      ) : (
        <input type="text" value={value} onChange={e => onValueChange(e.target.value)}
          style={inputBox} placeholder={s("type_here", lang.code)} />
      )}

      {!isDate && !isSelect && lang.code !== "en" && (
        <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center", direction: lang.rtl ? "rtl" : "ltr" }}>
          <span style={{ fontSize: 11, color: C.textLight }}>{s("answered_in", lang.code)}</span>
          <button onClick={() => onAnsweredInChange(lang.code)} style={{
            fontSize: 12, padding: "5px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
            border: answeredIn === lang.code ? `2px solid ${C.teal}` : `1.5px solid ${C.border}`,
            background: answeredIn === lang.code ? C.teal : C.white,
            color: answeredIn === lang.code ? C.white : C.textMid,
          }}>{lang.nativeLabel}</button>
          <button onClick={() => onAnsweredInChange("en")} style={{
            fontSize: 12, padding: "5px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
            border: answeredIn === "en" ? `2px solid ${C.teal}` : `1.5px solid ${C.border}`,
            background: answeredIn === "en" ? C.teal : C.white,
            color: answeredIn === "en" ? C.white : C.textMid,
          }}>{s("in_english", lang.code)}</button>
        </div>
      )}

      {needsEnTranslation && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: C.tealLight, border: `1.5px solid ${C.tealBorder}`, borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>English</div>
          <div style={{ fontSize: 13, color: translating ? C.textLight : C.text, fontStyle: translating ? "italic" : "normal", lineHeight: 1.5 }}>
            {translating ? s("translating", lang.code) : enTranslation || s("translation_here", lang.code)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Review Screen ──────────────────────────────────────────────────
interface ReviewScreenProps {
  formData: Record<string, string>;
  answeredIn: Record<string, string>;
  lang: Language;
  onBack: () => void;
}

function ReviewScreen({ formData, answeredIn, lang, onBack }: ReviewScreenProps) {
  const [enValues, setEnValues] = useState<Record<string, string>>({});
  const [translatingAll, setTranslatingAll] = useState(true);

  useEffect(() => {
    const run = async () => {
      setTranslatingAll(true);
      const updates: Record<string, string> = {};
      for (const sec of SECTIONS) {
        for (const f of sec.fields) {
          const val = formData[f.id];
          if (!val?.trim()) continue;
          const ans = answeredIn[f.id] || lang.code;
          if (ans === lang.code && lang.code !== "en" && f.type !== "date" && f.type !== "select") {
            updates[f.id] = await translateToEnglish(val, lang.code);
          } else {
            updates[f.id] = val;
          }
        }
      }
      setEnValues(updates);
      setTranslatingAll(false);
    };
    run();
  }, [formData, answeredIn, lang.code]);

  const needsTransCount = SECTIONS.flatMap(sec =>
    sec.fields.filter(f => {
      const ans = answeredIn[f.id] || lang.code;
      return ans === lang.code && lang.code !== "en" && formData[f.id]?.trim() && f.type !== "date" && f.type !== "select";
    })
  ).length;

  const download = (english: boolean) => {
    const lines: string[] = [`I-589 — ${english ? "English (for submission)" : `${lang.label} — family copy`}`, ""];
    SECTIONS.forEach(sec => {
      const filled = sec.fields.filter(f => formData[f.id]);
      if (!filled.length) return;
      lines.push(`=== ${s(sec.titleKey, english ? "en" : lang.code)} ===`);
      filled.forEach(f => {
        const label = s(f.labelKey, english ? "en" : lang.code);
        const val = english ? (enValues[f.id] || formData[f.id]) : formData[f.id];
        lines.push(`${label}: ${val}`);
      });
      lines.push("");
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
    a.download = english ? "i589-english.txt" : `i589-${lang.code}.txt`;
    a.click();
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 1100, margin: "0 auto", padding: "0 16px 6rem", color: C.text, direction: lang.rtl ? "rtl" : "ltr" }}>
      <div style={{ padding: "24px 0 20px", borderBottom: `3px solid ${C.teal}`, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: C.teal, marginBottom: 6 }}>USCIS I-589</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{s("review_title", lang.code)}</div>
            <div style={{ fontSize: 14, color: C.textMid, marginTop: 4, maxWidth: 560 }}>{s("review_desc", lang.code)}</div>
          </div>
          <button onClick={onBack} style={{ padding: "10px 20px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: C.text }}>
            {s("back_to_form", lang.code)}
          </button>
        </div>
      </div>

      {translatingAll && (
        <div style={{ background: C.tealLight, border: `1.5px solid ${C.tealBorder}`, borderRadius: 10, padding: "14px 18px", marginBottom: 20, fontSize: 14, color: C.teal, fontWeight: 600 }}>
          {s("translating", lang.code)}
        </div>
      )}

      {needsTransCount > 0 && !translatingAll && (
        <div style={{ background: C.amberLight, border: `1.5px solid ${C.amberBorder}`, borderRadius: 10, padding: "14px 18px", marginBottom: 20, fontSize: 14, color: C.amber, fontWeight: 600 }}>
          ⚠ {needsTransCount} {s("needs_trans_warn", lang.code)}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: C.teal }}>{s("for_review", lang.code)} — {lang.nativeLabel}</div>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: C.textMid }}>{s("for_submission", lang.code)}</div>
      </div>

      {SECTIONS.map(sec => {
        const filled = sec.fields.filter(f => formData[f.id]);
        if (!filled.length) return null;
        return (
          <div key={sec.id} style={{ marginBottom: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, padding: "10px 14px", background: C.gray, borderRadius: 8, borderLeft: lang.rtl ? "none" : `4px solid ${C.teal}`, borderRight: lang.rtl ? `4px solid ${C.teal}` : "none" }}>
                {s(sec.titleKey, lang.code)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, padding: "10px 14px", background: C.gray, borderRadius: 8, borderLeft: `4px solid ${C.tealBorder}` }}>
                {s(sec.titleKey, "en")}
              </div>
            </div>
            {filled.map(f => (
              <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 8 }}>
                <div style={{ background: C.tealLight, border: `1.5px solid ${C.tealBorder}`, borderRadius: 10, padding: 14, direction: lang.rtl ? "rtl" : "ltr" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6 }}>{s(f.labelKey, lang.code)}</div>
                  <div style={{ padding: "8px 10px", background: C.white, borderRadius: 8, border: `1.5px solid ${C.tealBorder}`, fontSize: 14, color: C.text, lineHeight: 1.5, minHeight: 38 }}>
                    {formData[f.id]}
                  </div>
                </div>
                <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6 }}>{s(f.labelKey, "en")}</div>
                  <div style={{ padding: "8px 10px", background: C.gray, borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 14, color: translatingAll ? C.textLight : C.text, lineHeight: 1.5, minHeight: 38, fontStyle: translatingAll ? "italic" : "normal" }}>
                    {translatingAll ? s("translating", lang.code) : (enValues[f.id] || formData[f.id])}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <div style={{ position: "sticky", bottom: 0, background: C.white, borderTop: `2px solid ${C.border}`, padding: "16px 0", display: "flex", gap: 12, flexWrap: "wrap" as const }}>
        <button onClick={() => download(false)} style={{ flex: 1, minWidth: 200, padding: "13px", borderRadius: 8, background: C.teal, color: C.white, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700 }}>
          {s("dl_native", lang.code)}
        </button>
        <button onClick={() => download(true)} style={{ flex: 1, minWidth: 200, padding: "13px", borderRadius: 8, background: C.white, color: C.teal, border: `2px solid ${C.teal}`, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700 }}>
          {s("dl_english", lang.code)}
        </button>
      </div>
    </div>
  );
}

// ─── Language Picker ────────────────────────────────────────────────
function LanguagePicker({ onSelect }: { onSelect: (l: Language) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minHeight: 400, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "3rem 16px", color: C.text }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: C.teal, marginBottom: 12 }}>USCIS Form I-589</div>
      <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 10, textAlign: "center" as const }}>Asylum Application Helper</div>
      <div style={{ fontSize: 15, color: C.textMid, marginBottom: 36, textAlign: "center" as const, maxWidth: 480, lineHeight: 1.6 }}>
        Choose your language · Elige tu idioma · اختر لغتك · Choisissez votre langue
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 440 }}>
        {LANGUAGES.map(l => (
          <button key={l.code} onClick={() => onSelect(l)}
            onMouseOver={() => setHovered(l.code)}
            onMouseOut={() => setHovered(null)}
            style={{
              padding: "20px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
              border: hovered === l.code ? `2px solid ${C.teal}` : `2px solid ${C.border}`,
              background: hovered === l.code ? C.tealLight : C.white,
              display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6,
              transition: "all 0.15s",
            }}>
            <span style={{ fontSize: 30 }}>{l.flag}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{l.nativeLabel}</span>
            <span style={{ fontSize: 13, color: C.textMid }}>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState<Language | null>(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [answeredIn, setAnsweredIn] = useState<Record<string, string>>({});
  const [showReview, setShowReview] = useState(false);

  if (!lang) return <LanguagePicker onSelect={setLang} />;
  if (showReview) return <ReviewScreen formData={formData} answeredIn={answeredIn} lang={lang} onBack={() => setShowReview(false)} />;

  const section = SECTIONS[activeSectionIdx];
  const totalFilled = Object.values(formData).filter(v => v?.trim()).length;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 680, margin: "0 auto", padding: "0 16px 4rem", color: C.text, direction: lang.rtl ? "rtl" : "ltr" }}>
      <div style={{ padding: "24px 0 20px", borderBottom: `3px solid ${C.teal}`, marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: C.teal, marginBottom: 6 }}>{s("app_subtitle", lang.code)}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" as const }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{s("app_title", lang.code)}</div>
            <div style={{ fontSize: 13, color: C.textMid }}>{s("app_desc", lang.code)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 6 }}>
            {totalFilled > 0 && <div style={{ fontSize: 12, color: C.textMid }}>{totalFilled} {s("fields_filled", lang.code)}</div>}
            <button onClick={() => setShowReview(true)} style={{ padding: "10px 20px", borderRadius: 8, background: C.teal, color: C.white, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>
              {s("review_export", lang.code)}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20, flexWrap: "wrap" as const }}>
        {LANGUAGES.map(l => (
          <button key={l.code} onClick={() => setLang(l)} style={{
            padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600,
            border: lang.code === l.code ? `2px solid ${C.teal}` : `1.5px solid ${C.border}`,
            background: lang.code === l.code ? C.teal : C.white,
            color: lang.code === l.code ? C.white : C.textMid,
          }}>{l.flag} {l.nativeLabel}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 20 }}>
        {SECTIONS.map((sec, i) => (
          <button key={sec.id} onClick={() => setActiveSectionIdx(i)} style={{
            padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700,
            border: activeSectionIdx === i ? `2px solid ${C.teal}` : `1.5px solid ${C.border}`,
            background: activeSectionIdx === i ? C.teal : C.white,
            color: activeSectionIdx === i ? C.white : C.textMid,
          }}>{s(sec.shortKey, lang.code)}</button>
        ))}
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 18, padding: "12px 16px", background: C.gray, borderRadius: 8, borderLeft: lang.rtl ? "none" : `4px solid ${C.teal}`, borderRight: lang.rtl ? `4px solid ${C.teal}` : "none" }}>
        {s(section.titleKey, lang.code)}
      </div>

      {section.fields.map(field => (
        <FieldRow
          key={field.id} field={field} lang={lang}
          value={formData[field.id] || ""}
          onValueChange={val => setFormData(prev => ({ ...prev, [field.id]: val }))}
          answeredIn={answeredIn[field.id] || lang.code}
          onAnsweredInChange={lc => setAnsweredIn(prev => ({ ...prev, [field.id]: lc }))}
        />
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: `1.5px solid ${C.border}` }}>
        <button onClick={() => setActiveSectionIdx(i => Math.max(0, i - 1))} disabled={activeSectionIdx === 0}
          style={{ padding: "10px 22px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: activeSectionIdx === 0 ? C.gray : C.white, color: activeSectionIdx === 0 ? C.textLight : C.text, cursor: activeSectionIdx === 0 ? "default" : "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700 }}>
          {s("previous", lang.code)}
        </button>
        {activeSectionIdx < SECTIONS.length - 1 ? (
          <button onClick={() => setActiveSectionIdx(i => Math.min(SECTIONS.length - 1, i + 1))}
            style={{ padding: "10px 22px", borderRadius: 8, background: C.teal, color: C.white, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700 }}>
            {s("next", lang.code)}
          </button>
        ) : (
          <button onClick={() => setShowReview(true)}
            style={{ padding: "10px 22px", borderRadius: 8, background: C.teal, color: C.white, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700 }}>
            {s("review_export", lang.code)}
          </button>
        )}
      </div>
    </div>
  );
}

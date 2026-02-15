export type Locale = "en" | "de";

export const translations: Record<
  Locale,
  {
    sidebar: { navUnibuddy: string; navNavigate: string; dashboard: string; home: string; myModules: string; myPastTests: string; adminInbox: string; users: string };
    dashboard: {
      punchline: string;
      heroTitle1: string;
      heroTitle2: string;
      heroTitleSuffix: string;
      heroSub: string;
      createFirstQuiz: string;
      whereNext: string;
      unlockedCreditsSignupBefore: string;
      unlockedCreditsSignupAfter: string;
      myModules: string;
      myModulesDesc: string;
      openMyModules: string;
      myPastTests: string;
      myPastTestsDesc: string;
      openMyPastTests: string;
      adminInbox: string;
      adminInboxDesc: string;
      openAdminInbox: string;
      pricingTitle: string;
      pricingSubtitle: string;
      pricingFeatureMcq: string;
      pricingFeatureWritten: string;
      pricingFeatureRenewal: string;
      planFree: string;
      planFreeFor: string;
      planPremium: string;
      planPremiumFor: string;
      planPro: string;
      planProFor: string;
      planFreePrice: string;
      planFreeCredits: string;
      planPremiumPrice: string;
      planPremiumTokens: string;
      planProPrice: string;
      planProTokens: string;
      comingSoon: string;
      imInterested: string;
      interestRecorded: string;
      currentPlan: string;
    };
    modules: {
      title: string;
      subtitle: string;
      addModule: string;
      noModules: string;
      noModulesDesc: string;
      createFirstQuiz: string;
      questions: string;
      deleteModule: string;
      deleteMessage: string;
      cancel: string;
      delete: string;
      deleteAria: string;
    };
    moduleDetail: {
      moduleNotFound: string;
      backToModules: string;
      startStrict: string;
      practiceMode: string;
      shortForm: string;
      longForm: string;
      cardMcqTimed: string;
      cardMcqPractice: string;
      cardShortForm: string;
      cardLongForm: string;
      cardStart: string;
      credit: string;
      credits: string;
      configuration: string;
      configDesc: string;
      questions: string;
      types: string;
      kAusN: string;
      singleChoice: string;
      tabQuestions: string;
      tabSource: string;
      questionsHidden: string;
      questionsHiddenHint: string;
    };
    newModule: {
      title: string;
      subtitle: string;
      uploadTitle: string;
      uploadDesc: string;
      usesCredit: string;
      uploadConfirm: string;
      selectFile: string;
      chooseAnother: string;
      pdfHint: string;
      uploadHint: string;
      quizName: string;
      quizNameDesc: string;
      nameLabel: string;
      namePlaceholder: string;
      errorPdfName: string;
      errorNoText: string;
      errorGeneric: string;
      readingPdf: string;
      generating: string;
      createQuiz: string;
    };
    exam: {
      moduleNotFound: string;
      backToModules: string;
      noQuestions: string;
      backToModule: string;
      correct: string;
      gradingScale: string;
      backToModuleButton: string;
      retryExam: string;
      weakAreas: string;
      weakAreasDesc: string;
      takeTestAgain: string;
      takeTestAgainConfirm: string;
      takeTestAgainError: string;
      review: string;
      reviewDesc: string;
      questionOf: string;
      questionOfLabel: string;
      flag: string;
      flagged: string;
      selectOne: string;
      selectAll: string;
      chooseAllCorrect: string;
      previous: string;
      next: string;
      submit: string;
      yourAnswer: string;
      correctLabel: string;
      singleChoice: string;
      kAusNMultiple: string;
    };
    writtenExam: {
      title: string;
      shortTitle: string;
      longTitle: string;
      questionLabel: string;
      generatingQuestion: string;
      instructionShort: string;
      instructionLong: string;
      typeOrUpload: string;
      uploadUsesCredit: string;
      uploadConfirm: string;
      wordCount: string;
      wordLimitShort: string;
      wordLimitLong: string;
      uploadAnswer: string;
      uploadHint: string;
      extracting: string;
      submit: string;
      evaluating: string;
      timeUp: string;
      score: string;
      feedback: string;
      backToModule: string;
      errorNoAnswer: string;
      errorNoCredits: string;
    };
    pastTests: {
      title: string;
      noTests: string;
      noTestsDesc: string;
      deleteConfirm: string;
      testTypeMcq: string;
      testTypeShort: string;
      testTypeLong: string;
      backToPastTests: string;
      backToHome: string;
    };
    letterScanner: {
      title: string;
      subtitle: string;
      letter: string;
      letterDesc: string;
      dropReplace: string;
      dropHint: string;
      scanLetter: string;
      summary: string;
      summaryDesc: string;
      actionRequired: string;
      due: string;
      amount: string;
      toneCheck: string;
      toneCheckDesc: string;
      errorGeneric: string;
    };
  }
> = {
  en: {
    sidebar: {
      navUnibuddy: "ExamPal",
      navNavigate: "Navigate",
      dashboard: "Dashboard",
      home: "Home",
      myModules: "My Modules",
      myPastTests: "My Past tests",
      adminInbox: "Admin Inbox",
      users: "Users",
    },
    dashboard: {
      punchline: "Your AI survival toolkit for international students in Germany.",
      heroTitle1: "Turn lecture notes into",
      heroTitle2: "practice exams",
      heroTitleSuffix: " in seconds",
      heroSub:
        "Upload your PDFs and AI creates personalized multiple-choice questions—single and K-aus-N style—so you can practice like the real exam.",
      createFirstQuiz: "Create your first quiz",
      whereNext: "Where to go next",
      unlockedCreditsSignupBefore: "You just unlocked 5 credits ",
      unlockedCreditsSignupAfter: " by signing up!",
      myModules: "My Modules",
      myModulesDesc:
        "View your modules, take mock exams, or add a new one. All your quizzes in one place.",
      openMyModules: "Open My Modules",
      myPastTests: "My Past tests",
      myPastTestsDesc: "View results and review your previous MCQ and written tests.",
      openMyPastTests: "Open My Past tests",
      adminInbox: "Admin Inbox",
      adminInboxDesc:
        "Scan and decode official letters from your university or authorities—never miss a deadline.",
      openAdminInbox: "Open Admin Inbox",
      pricingTitle: "Unlock more power with the right plan",
      pricingSubtitle: "All plans include automatic monthly credit renewal.",
      pricingFeatureMcq: "MCQ mock exams",
      pricingFeatureWritten: "Short & long form written tests",
      pricingFeatureRenewal: "All plans include automatic monthly credit renewal",
      planFree: "Basic",
      planFreeFor: "For beginners",
      planPremium: "Premium",
      planPremiumFor: "More tests per month",
      planPro: "Pro",
      planProFor: "Most tests per month",
      planFreePrice: "Free",
      planFreeCredits: "5 credits per month",
      planPremiumPrice: "€4.99 per month",
      planPremiumTokens: "50 credits per month",
      planProPrice: "€8.99 per month",
      planProTokens: "120 credits per month",
      comingSoon: "Coming soon",
      imInterested: "I'm Interested!",
      interestRecorded: "Your response was recorded. We will inform you when new plans are launched.",
      currentPlan: "Current plan",
    },
    modules: {
      title: "My Modules",
      subtitle: "Your quizzes and practice exams in one place",
      addModule: "Add module",
      noModules: "No modules yet",
      noModulesDesc:
        "Upload a lecture PDF and AI will create a personalized quiz with single-choice and K-aus-N questions in seconds.",
      createFirstQuiz: "Create your first quiz",
      questions: "questions",
      deleteModule: "Delete module?",
      deleteMessage:
        'This will permanently delete "{{name}}" and all its questions. This action cannot be undone.',
      cancel: "Cancel",
      delete: "Delete",
      deleteAria: "Delete module",
    },
    moduleDetail: {
      moduleNotFound: "Module not found.",
      backToModules: "Back to modules",
      startStrict: "Start mock exam (strict)",
      practiceMode: "Practice mode",
      shortForm: "Short form (2 credits)",
      longForm: "Long form (3 credits)",
      cardMcqTimed: "MCQ test (timed)",
      cardMcqPractice: "MCQ test (Practice)",
      cardShortForm: "Short form test",
      cardLongForm: "Long form test",
      cardStart: "Start",
      credit: "1 credit",
      credits: "{{n}} credits",
      configuration: "Configuration",
      configDesc:
        "Strict = K-aus-N (all correct answers required). Practice = hints allowed.",
      questions: "Questions",
      types: "Types",
      kAusN: "K-aus-N",
      singleChoice: "single-choice",
      tabQuestions: "Questions",
      tabSource: "Source text (excerpt)",
      questionsHidden: "Questions are hidden until you start the test.",
      questionsHiddenHint:
        'Use "Start mock exam (strict)" or "Practice mode" above to begin.',
    },
    newModule: {
      title: "Create a quiz from your notes",
      subtitle:
        "Upload a PDF and AI creates personalized multiple-choice questions in seconds—single and K-aus-N style.",
      uploadTitle: "Upload your material",
      uploadDesc: "Lecture slides, Skripte, or Gedächtnisprotokolle. PDF or images (scans, photos).",
      usesCredit: "1 credit",
      uploadConfirm: "Creating a module uses 1 credit. Continue to select a file?",
      selectFile: "Click to select a file",
      chooseAnother: "Click to choose another file",
      pdfHint: "PDF up to 50MB",
      uploadHint: "PDF or images (scans, photos) of documents",
      quizName: "Quiz name",
      quizNameDesc: "Give this quiz a name, e.g. Microeconomics, Data Science",
      nameLabel: "Name",
      namePlaceholder: "e.g. Statistics I",
      errorPdfName: "Please select a file.",
      errorNoText: "Could not extract text from the PDF.",
      errorGeneric: "Something went wrong.",
      readingPdf: "Reading PDF…",
      generating: "Generating questions…",
      createQuiz: "Create quiz",
    },
    exam: {
      moduleNotFound: "Module not found.",
      backToModules: "Back to modules",
      noQuestions: "No questions in this module.",
      backToModule: "Back to module",
      correct: "correct",
      gradingScale: "German grading scale: 1.0 (best) to 5.0 (fail).",
      backToModuleButton: "Back to module",
      retryExam: "Retry exam",
      weakAreas: "Weak areas",
      weakAreasDesc: "Topics you got wrong—re-read these from your material.",
      takeTestAgain: "Take test again",
      takeTestAgainConfirm: "This will use 1 credit. Start a new test in this module?",
      takeTestAgainError: "Could not use credit. You may not have enough credits.",
      review: "Review",
      reviewDesc: "All questions with your answers and correct answers",
      questionOf: "Question",
      questionOfLabel: "of",
      flag: "Flag",
      flagged: "Flagged",
      selectOne: "Select one answer",
      selectAll: "Select all that apply (K-aus-N)",
      chooseAllCorrect: "Choose all correct answers",
      previous: "Previous",
      next: "Next",
      submit: "Submit",
      yourAnswer: "(your answer)",
      correctLabel: "(correct)",
      singleChoice: "Single choice",
      kAusNMultiple: "K-aus-N (multiple)",
    },
    writtenExam: {
      title: "Written exam",
      shortTitle: "Short form",
      longTitle: "Long form",
      questionLabel: "Question",
      generatingQuestion: "Generating question…",
      instructionShort: "Answer in your own words (max 50 words). You can type below or upload a photo, PDF, or Word document.",
      instructionLong: "Write a detailed answer (up to ~3 pages). You can type below or upload a photo, PDF, or Word document.",
      typeOrUpload: "Type your answer or upload a file",
      uploadUsesCredit: "1 credit",
      uploadConfirm: "Extracting text from your upload uses 1 credit. Continue?",
      wordCount: "Words",
      wordLimitShort: "Max 50 words",
      wordLimitLong: "Up to ~750 words (3 pages)",
      uploadAnswer: "Upload answer",
      uploadHint: "Photo, PDF, or Word (.docx)",
      extracting: "Extracting text…",
      submit: "Submit for evaluation",
      evaluating: "Evaluating your answer…",
      timeUp: "Time is up. Submitting your answer.",
      score: "Score",
      feedback: "Feedback",
      backToModule: "Back to module",
      errorNoAnswer: "Please enter or upload your answer.",
      errorNoCredits: "Not enough credits for this test.",
    },
    pastTests: {
      title: "My Past tests",
      noTests: "No past tests yet",
      noTestsDesc: "Completed MCQ and written tests will appear here.",
      deleteConfirm: "Delete this past test?",
      testTypeMcq: "MCQ",
      testTypeShort: "Short form",
      testTypeLong: "Long form",
      backToPastTests: "Back to past tests",
      backToHome: "Back to Home",
    },
    letterScanner: {
      title: "Admin Inbox",
      subtitle:
        "Upload a letter from the University or Ausländerbehörde to get an English summary and see if you need to take action.",
      letter: "Letter",
      letterDesc: "PDF or image (photo) of the official letter",
      dropReplace: "Drop another to replace",
      dropHint: "Drop a PDF or image here or click to browse",
      scanLetter: "Scan letter",
      summary: "Summary",
      summaryDesc: "Plain English summary",
      actionRequired: "Action required",
      due: "Due",
      amount: "Amount",
      toneCheck: "Tone check",
      toneCheckDesc: "Quick reassurance",
      errorGeneric: "Something went wrong.",
    },
  },
  de: {
    sidebar: {
      navUnibuddy: "ExamPal",
      navNavigate: "Navigation",
      dashboard: "Dashboard",
      home: "Start",
      myModules: "Meine Module",
      myPastTests: "Meine vergangenen Tests",
      adminInbox: "Posteingang",
      users: "Nutzer",
    },
    dashboard: {
      punchline: "Dein KI-Überlebenswerkzeug für internationale Studierende in Deutschland.",
      heroTitle1: "Verwandele Vorlesungsnotizen in",
      heroTitle2: "Übungsklausuren",
      heroTitleSuffix: " in Sekunden",
      heroSub:
        "Lade PDFs hoch und KI erstellt personalisierte Multiple-Choice-Fragen—Single und K-aus-N—damit du wie in der echten Prüfung üben kannst.",
      createFirstQuiz: "Erstelle deinen ersten Quiz",
      whereNext: "Weiter geht's",
      unlockedCreditsSignupBefore: "Du hast gerade 5 Credits ",
      unlockedCreditsSignupAfter: " durch Anmelden freigeschaltet!",
      myModules: "Meine Module",
      myModulesDesc:
        "Module ansehen, Probeklausuren schreiben oder ein neues anlegen. Alle Quizzes an einem Ort.",
      openMyModules: "Meine Module öffnen",
      myPastTests: "Meine vergangenen Tests",
      myPastTestsDesc: "Ergebnisse und Auswertungen deiner bisherigen MCQ- und Schriftlichen Tests.",
      openMyPastTests: "Meine vergangenen Tests öffnen",
      adminInbox: "Posteingang",
      adminInboxDesc:
        "Offizielle Schreiben von Uni oder Behörden scannen und entschlüsseln—keine Frist verpassen.",
      openAdminInbox: "Posteingang öffnen",
      pricingTitle: "Mehr Leistung mit dem richtigen Plan",
      pricingSubtitle: "Alle Pläne beinhalten automatische monatliche Credit-Erneuerung.",
      pricingFeatureMcq: "MCQ-Probeklausuren",
      pricingFeatureWritten: "Kurz- und Langform-Schreibtests",
      pricingFeatureRenewal: "Alle Pläne beinhalten automatische monatliche Credit-Erneuerung",
      planFree: "Basic",
      planFreeFor: "Für Einsteiger",
      planPremium: "Premium",
      planPremiumFor: "Mehr Tests pro Monat",
      planPro: "Pro",
      planProFor: "Die meisten Tests pro Monat",
      planFreePrice: "Kostenlos",
      planFreeCredits: "5 Credits pro Monat",
      planPremiumPrice: "4,99 € pro Monat",
      planPremiumTokens: "50 Credits pro Monat",
      planProPrice: "8,99 € pro Monat",
      planProTokens: "120 Credits pro Monat",
      comingSoon: "Demnächst",
      imInterested: "Ich habe Interesse!",
      interestRecorded: "Deine Antwort wurde gespeichert. Wir informieren dich, wenn neue Pläne starten.",
      currentPlan: "Aktueller Plan",
    },
    modules: {
      title: "Meine Module",
      subtitle: "Deine Quizzes und Übungsklausuren an einem Ort",
      addModule: "Modul hinzufügen",
      noModules: "Noch keine Module",
      noModulesDesc:
        "Lade ein Vorlesungs-PDF hoch und die KI erstellt in Sekunden einen personalisierten Quiz mit Single- und K-aus-N-Fragen.",
      createFirstQuiz: "Erstelle deinen ersten Quiz",
      questions: "Fragen",
      deleteModule: "Modul löschen?",
      deleteMessage:
        'Das Modul "{{name}}" und alle zugehörigen Fragen werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
      cancel: "Abbrechen",
      delete: "Löschen",
      deleteAria: "Modul löschen",
    },
    moduleDetail: {
      moduleNotFound: "Modul nicht gefunden.",
      backToModules: "Zurück zu den Modulen",
      startStrict: "Probeklausur starten (streng)",
      practiceMode: "Übungsmodus",
      shortForm: "Kurzform (2 Credits)",
      longForm: "Langform (3 Credits)",
      cardMcqTimed: "MCQ-Test (mit Zeitlimit)",
      cardMcqPractice: "MCQ-Test (Übung)",
      cardShortForm: "Kurzform-Test",
      cardLongForm: "Langform-Test",
      cardStart: "Starten",
      credit: "1 Credit",
      credits: "{{n}} Credits",
      configuration: "Einstellungen",
      configDesc:
        "Streng = K-aus-N (alle richtigen Antworten nötig). Übung = Tipps erlaubt.",
      questions: "Fragen",
      types: "Typen",
      kAusN: "K-aus-N",
      singleChoice: "Single-Choice",
      tabQuestions: "Fragen",
      tabSource: "Quelltext (Auszug)",
      questionsHidden: "Fragen sind versteckt, bis du den Test startest.",
      questionsHiddenHint:
        'Klicke oben auf "Probeklausur starten (streng)" oder "Übungsmodus".',
    },
    newModule: {
      title: "Quiz aus deinen Notizen erstellen",
      subtitle:
        "PDF hochladen und die KI erstellt in Sekunden personalisierte Multiple-Choice-Fragen—Single und K-aus-N.",
      uploadTitle: "Material hochladen",
      uploadDesc: "Vorlesungsfolien, Skripte oder Gedächtnisprotokolle. PDF oder Bilder (Scans, Fotos).",
      usesCredit: "1 Credit",
      uploadConfirm: "Das Erstellen eines Moduls kostet 1 Credit. Datei auswählen?",
      selectFile: "Klicken zum Auswählen",
      chooseAnother: "Klicken für andere Datei",
      pdfHint: "PDF bis 50MB",
      uploadHint: "PDF oder Bilder (Scans, Fotos) von Dokumenten",
      quizName: "Quizname",
      quizNameDesc: "Gib dem Quiz einen Namen, z. B. Mikroökonomik, Data Science",
      nameLabel: "Name",
      namePlaceholder: "z. B. Statistik I",
      errorPdfName: "Bitte wähle eine Datei aus.",
      errorNoText: "Text konnte nicht aus dem PDF extrahiert werden.",
      errorGeneric: "Etwas ist schiefgelaufen.",
      readingPdf: "PDF wird gelesen…",
      generating: "Fragen werden erstellt…",
      createQuiz: "Quiz erstellen",
    },
    exam: {
      moduleNotFound: "Modul nicht gefunden.",
      backToModules: "Zurück zu den Modulen",
      noQuestions: "In diesem Modul sind keine Fragen.",
      backToModule: "Zurück zum Modul",
      correct: "richtig",
      gradingScale: "Deutsche Noten: 1,0 (beste) bis 5,0 (nicht bestanden).",
      backToModuleButton: "Zurück zum Modul",
      retryExam: "Klausur wiederholen",
      weakAreas: "Schwache Bereiche",
      weakAreasDesc: "Themen, die du falsch beantwortet hast—lies diese im Material nach.",
      takeTestAgain: "Test wiederholen",
      takeTestAgainConfirm: "Das kostet 1 Credit. Neuen Test in diesem Modul starten?",
      takeTestAgainError: "Credit konnte nicht abgezogen werden. Möglicherweise hast du nicht genug Credits.",
      review: "Auswertung",
      reviewDesc: "Alle Fragen mit deinen und den richtigen Antworten",
      questionOf: "Frage",
      questionOfLabel: "von",
      flag: "Markieren",
      flagged: "Markiert",
      selectOne: "Eine Antwort wählen",
      selectAll: "Alle zutreffenden wählen (K-aus-N)",
      chooseAllCorrect: "Alle richtigen Antworten wählen",
      previous: "Zurück",
      next: "Weiter",
      submit: "Abgeben",
      yourAnswer: "(deine Antwort)",
      correctLabel: "(richtig)",
      singleChoice: "Single-Choice",
      kAusNMultiple: "K-aus-N (mehrere)",
    },
    writtenExam: {
      title: "Schriftliche Prüfung",
      shortTitle: "Kurzform",
      longTitle: "Langform",
      questionLabel: "Frage",
      generatingQuestion: "Frage wird erstellt…",
      instructionShort: "Antworte in eigenen Worten (max. 50 Wörter). Du kannst unten tippen oder ein Foto, PDF oder Word-Dokument hochladen.",
      instructionLong: "Schreibe eine ausführliche Antwort (bis ca. 3 Seiten). Du kannst unten tippen oder ein Foto, PDF oder Word-Dokument hochladen.",
      typeOrUpload: "Antwort tippen oder Datei hochladen",
      uploadUsesCredit: "1 Credit",
      uploadConfirm: "Die Texterkennung aus deinem Upload kostet 1 Credit. Fortfahren?",
      wordCount: "Wörter",
      wordLimitShort: "Max. 50 Wörter",
      wordLimitLong: "Bis ca. 750 Wörter (3 Seiten)",
      uploadAnswer: "Antwort hochladen",
      uploadHint: "Foto, PDF oder Word (.docx)",
      extracting: "Text wird extrahiert…",
      submit: "Zur Bewertung einreichen",
      evaluating: "Deine Antwort wird bewertet…",
      timeUp: "Zeit abgelaufen. Deine Antwort wird eingereicht.",
      score: "Punktzahl",
      feedback: "Rückmeldung",
      backToModule: "Zurück zum Modul",
      errorNoAnswer: "Bitte gib deine Antwort ein oder lade eine Datei hoch.",
      errorNoCredits: "Nicht genug Credits für diesen Test.",
    },
    pastTests: {
      title: "Meine vergangenen Tests",
      noTests: "Noch keine vergangenen Tests",
      noTestsDesc: "Abgeschlossene MCQ- und Schriftliche Tests erscheinen hier.",
      deleteConfirm: "Diesen vergangenen Test löschen?",
      testTypeMcq: "MCQ",
      testTypeShort: "Kurzform",
      testTypeLong: "Langform",
      backToPastTests: "Zurück zu vergangenen Tests",
      backToHome: "Zurück zur Startseite",
    },
    letterScanner: {
      title: "Posteingang",
      subtitle:
        "Lade ein Schreiben von Uni oder Ausländerbehörde hoch für eine englische Zusammenfassung und um zu sehen, ob du handeln musst.",
      letter: "Schreiben",
      letterDesc: "PDF oder Foto des offiziellen Schreibens",
      dropReplace: "Andere Datei zum Ersetzen ablegen",
      dropHint: "PDF oder Bild hier ablegen oder klicken",
      scanLetter: "Schreiben scannen",
      summary: "Zusammenfassung",
      summaryDesc: "Zusammenfassung auf Englisch",
      actionRequired: "Handlung erforderlich",
      due: "Frist",
      amount: "Betrag",
      toneCheck: "Einschätzung",
      toneCheckDesc: "Kurze Einordnung",
      errorGeneric: "Etwas ist schiefgelaufen.",
    },
  },
};

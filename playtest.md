1. Der aktuelle Stand des Spiels
 Das Spiel ist eine voll spielbare und komplexe Ressourcen-Management-Simulation ("Der letzte König"). Der aktuelle Stand umfasst ein interaktives Startmenü mit einem "How to Play"-Tutorial und drei wählbaren Presets (Vorgeschichten), die den Startzustand der Kolonie definieren. Das Kern-Gameplay besteht aus ineinandergreifenden Systemen:   
    - Ressourcen-Management (Geld, Nahrung, Sauerstoff, Bevölkerungsklassen)
    - Geopolitik (Handel basierend auf Fraktionsloyalität) 
    - Ökologie-System
    - Spieler können durch ihre Entscheidungen und das Balancieren von Werten wie Wissen, Zufriedenheit und Angst vier verschiedene Enden erreichen

2. Warum der Playtest stattgefunden hat (Ziel des Playtests)
 Das primäre Ziel dieses Playtests war eine ganzheitliche Evaluierung der "First-Time User Experience". Da das Spiel mittlerweile über komplexe, ineinandergreifende Systeme verfügt, sollte getestet werden, ob das Spieldesign für einen komplett neuen Spieler ohne externe Hilfe verständlich und spielbar ist.
 Der Tester hatte im Vorfeld keinerlei Berührungspunkte mit dem Projekt und kannte als einzige Grundlage lediglich die Konzept-Präsentation. Darauf aufbauend sollten folgende Kernaspekte evaluiert werden:
    - Onboarding & UI-Intuitivität: Reichen die Vorab-Präsentation, das in-game "How to Play"-Tutorial und die Tooltips aus, um das Spiel selbstständig zu erlernen? Findet der Spieler intuitiv alle wichtigen Menüs (Infrastruktur, Akademie, Geopolitik) und versteht er die Bedeutung der Icons im oberen UI-Balken?
    - Verständnis der Kernkonflikte (Trade-offs): Die Präsentation verspricht, dass "jeder Vorteil seinen Preis" hat. Begreift der Spieler diese Balance im Gameplay? Versteht er beispielsweise, dass höhere Steuern zwar mehr Geld bringen, aber die Zufriedenheit senken, oder dass mehr Wissen auf Dauer die eigene Macht gefährden kann?  
    - Navigation in Richtung der Enden (Pacing & Zielsetzung): Wie verhält sich der Spieler im Mid- und Late-Game? Setzt er sich bewusst das Ziel, ein bestimmtes Ende zu erreichen (z. B. Flucht mit der Arche oder Rettung des Planeten durch Stabilisatoren), oder stolpert er unkontrolliert in ein "Game Over" (wie eine Rebellion oder den Kollaps des Planeten)?
    - Atmosphäre und Rollenspiel: Kommt das im Pitch Deck beschriebene Gefühl rüber, als Herrscher einer Weltraumkolonie zu agieren, die "auf einer alten Lüge" aufgebaut ist? Nutzt der Spieler aktiv Instrumente wie Propaganda oder Angst, um das Volk zu kontrollieren?  
    - Prioritätensetzung im Ressourcen-Management: Wie gut gelingt es dem Spieler, das komplexe Netz aus Systemen (Nahrung, Sauerstoff, Planetenzustand, Zufriedenheit) auszubalancieren? Reagiert er rechtzeitig auf Ressourcenknappheit und Systemwarnungen, bevor eine Todesspirale entsteht?

3. Durchführung
 Der Playtest wurde am 03.06.2026 mit einer Person durchgeführt, die das Spiel und die vorherigen Abgaben zuvor noch nie gesehen hat. Der Bildschirm und die Reaktionen des Testers wurden auf Video aufgezeichnet. Die Methode des "Lautes Denkens" (Think Aloud Protocol) wurde angewendet. Ich als Entwickler habe das Spielgeschehen lediglich dokumentiert und keine Hilfestellungen oder Erklärungen gegeben, um die "First-Time User Experience" nicht zu verfälschen.

4. Beobachtungen & Raw Feedback
 Der Playtest lieferte wertvolle Einblicke, sowohl positive Aspekte als auch konkrete Schmerzpunkte des Spielers:
    Positive Beobachtungen (Pros):
        - Der Tester lobte die Grundidee und das Setting (die Mischung aus Sci-Fi-Kosmos und mittelalterlichen Machtstrukturen).
        - Die Lore wurde als fesselnd empfunden.
        - Die verschiedenen Enden und deren spielerische Umsetzung wurden als sehr interessant und motivierend bewertet.

    Kritische Beobachtungen (Cons):
        - Branding-Verwirrung: Das Startmenü mit dem Titel "The King's Legacy" verwirrte den Tester. Er dachte, dies sei der Name des Spiels (anstatt "Der letzte König").
        - Unklare Item-Effekte: Es war nicht intuitiv verständlich, was bestimmte Gegenstände (wie Artefakte) genau bewirken und wie viel "Wissen" sie generieren.
        - Tutorial-Lücken: Wichtige Mechaniken wurden im "How to Play" nicht ausreichend erklärt. Der Tester wusste nicht, dass zu viel Wissen negative Konsequenzen hat, und verstand nicht, wie man Arbeiter zu Ingenieuren aufwertet.
        - Forderung nach Warn-Pop-ups: Der Tester übersah die System-Logs, rannte versehentlich in ein schlechtes Ende und forderte aufdringliche Vollbild-Warnungen, bevor er den "Next Day"-Button drückt.
        - Sichtbarkeit: Die Icons im oberen Ressourcen-Balken (Topbar) wurden als zu klein und schwer unterscheidbar empfunden.
        - Spielgeschwindigkeit: Der Tester wünschte sich eine "Skip X Days"-Funktion, um mehrere Tage auf einmal überspringen zu können, statt jeden Tag einzeln wegzuklicken.
        - Sprachinkonsistenz: Der Tester hat angemerkt, dass das Spiel sprachlich nicht einheitlich ist. Einige Teile des Spiels sind noch auf Deutsch verfasst, während der Rest auf Englisch ist. Diese Sprachmischung wurde als störend und verwirrend empfunden.
        - Ressourcen im Minusbereich (Bug): Der Tester hat einen Fehler bemerkt, bei dem der Sauerstoff (O2) und einige andere physische Ressourcen in der oberen Leiste (Topbar) in den negativen Bereich fallen konnten. Dies wurde als unrealistisch und fehlerhaft wahrgenommen, da man physisch keine "negativen" Ressourcen besitzen kann.
5. Erkenntnisse & Feedback-Verarbeitung
 Bei der Analyse des Feedbacks wurde deutlich, dass nicht jeder Wunsch des Testers dem Spieldesign zugutekommt. Das Feedback wurde wie folgt evaluiert und verarbeitet:
    Erkenntnis 1: Informationslücken & UI-Klarheit (Wird umgesetzt)
        - Analyse: Das Feedback bezüglich unklarer Mechaniken und der UI-Lesbarkeit ist absolut berechtigt. Wenn der Spieler nicht weiß, dass Artefakte Wissen generieren, oder dass hohes Wissen gefährlich ist, wirkt das Spiel unfair. Auch die Verwirrung um den Spielnamen muss behoben werden.
        - Verarbeitung: Die Topbar-Icons werden vergrößert, um sie auf den ersten Blick lesbar zu machen. Der Titel im Startmenü wird korrigiert. Zudem muss das "How to Play"-Tutorial um die Gefahren von Wissen und das Bürger-Aufwertungssystem (Schulen/Akademie) ergänzt werden. Für Items wie Artefakte werden präzise Zahlenwerte in den Tooltips benötigt.
    Erkenntnis 2: Eigenverantwortung vs. "Handholding" (Wird bewusst abgelehnt)
        - Analyse: Die Forderung des Testers, vor jedem Tagesabschluss eine Vollbild-Warnung bei kritischen Werten zu erhalten, um schlechte Enden zu vermeiden, widerspricht der Kernphilosophie des Spiels.
        - Verarbeitung: Dieses Feedback setze ich nicht um. In der Rolle eines Königs ist Aufmerksamkeit eine essenzielle Fähigkeit. Wenn der Spieler unachtsam ist und die bereits vorhandenen System-Logs ignoriert, ist der Untergang der Kolonie das Resultat seiner eigenen Nachlässigkeit. Das Spiel soll diese Unachtsamkeit bestrafen, anstatt dem Spieler alle Konsequenzen durch Pop-ups abzunehmen.
    Erkenntnis 3: Pacing und Core Gameplay Loop (Wird bewusst abgelehnt)
        - Analyse: Der Wunsch, beliebig viele Tage überspringen zu können ("Skip X Days"), entspringt wahrscheinlich der Ungeduld beim Warten auf Ressourcen.
        - Verarbeitung: Auch dieses Feedback wird nicht 1:1 umgesetzt. Eine solche Skip-Funktion würde die Möglichkeit des Spielers zerstören, auf plötzliche Krisen (wie plötzlichen Nahrungsverlust oder sinkende Zufriedenheit) rechtzeitig zu reagieren. Der Rhythmus von "Next Day" erzwingt eine kontinuierliche, tägliche Planung, was für das Ressourcen-Management und das Balancing der Spielökonomie zwingend erforderlich ist.
    Erkenntnis 4: Vollständige englische Lokalisierung (Wird umgesetzt)
        - Analyse: Das Feedback ist absolut berechtigt. Ein ständiger Wechsel zwischen Englisch und Deutsch bricht die Immersion und wirkt auf neue Spieler unfertig. Eine Simulation, die auf Atmosphäre setzt, benötigt eine konsistente Sprache.
        - Verarbeitung: Ich stimme diesem Feedback vollkommen zu. Die klare Design-Entscheidung lautet, dass das gesamte Spiel ausschließlich auf Englisch sein muss. Alle verbleibenden deutschen Texte, UI-Beschriftungen und System-Logs werden in der nächsten Iteration vollständig ins Englische übersetzt, um eine einheitliche und professionelle Spielerfahrung zu gewährleisten.
    Erkenntnis 5: Mathematische Begrenzung der Ressourcenwerte (Wird umgesetzt)
        - Analyse: Dieses Feedback deckt einen klaren logischen Fehler (Bug) im Code auf. Physische Ressourcen wie Sauerstoff oder Nahrung können nicht negativ sein – wenn sie aufgebraucht sind, sind sie bei genau null. Dass die UI negative Werte anzeigt, bricht die Immersion und zeigt, dass das Spiel den Mangel mathematisch nicht korrekt abfängt.
        - Verarbeitung: Dieser Bug wird behoben. Die Spiellogik wird im nächsten Schritt so angepasst, dass physische Ressourcenwerte (wie O2 und Nahrung) bei 0 abgeriegelt (geclampt) werden. Wenn der tägliche Verbrauch die Produktion übersteigt und der Wert 0 erreicht, darf die Anzeige nicht ins Minus gehen. Stattdessen wird das Spiel bei exakt 0 die korrekten Strafen auslösen (z. B. das sofortige Sterben der Bevölkerung durch Verhungern oder Ersticken).
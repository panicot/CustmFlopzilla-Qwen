# 🎴 Analitzador de Rangs de Pòquer

Eina web d'anàlisi estadística de rangs de pòquer inspirada en [Flopzilla](https://flopzilla.com/). Permet avaluar la composició i força del rang d'un rival contra qualsevol board (flop, turn o river), sense necessitat d'introduir una mà pròpia.

![Versió](https://img.shields.io/badge/versió-1.0.0-6d4aff)
![Llicència](https://img.shields.io/badge/llicència-MIT-22c55e)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)
![React](https://img.shields.io/badge/React-18-61dafb)

---

## 📋 Taula de Continguts

- [Descripció](#-descripció)
- [Característiques](#-característiques)
- [Captures de pantalla](#-captures-de-pantalla)
- [Stack Tecnològic](#-stack-tecnològic)
- [Instal·lació i Ús](#-instal·lació-i-ús)
- [Estructura del Projecte](#-estructura-del-projecte)
- [Com Funciona](#-com-funciona)
- [Casos d'Ús i Exemples](#-casos-dús-i-exemples)
- [Casos Límit Validats](#-casos-límit-validats)
- [Futures Millores](#-futures-millores)
- [Llicència](#-llicència)

---

## 📖 Descripció

L'**Analitzador de Rangs de Pòquer** és una aplicació web local dissenyada per a jugadors de pòquer que volen entendre millor la distribució de mans possibles del rival en funció del rang que juga i les cartes comunitàries del board.

A diferència d'altres eines, aquest analitzador:

- ✅ **No requereix introduir una mà pròpia** — se centra exclusivament en l'anàlisi estadística del rang rival.
- ✅ **Funciona 100% al navegador** — no necessita backend ni dependències externes.
- ✅ **Calcula en temps real** — els resultats s'actualitzen instantàniament en canviar el rang o el board.
- ✅ **Classifica mans amb precisió** — distingeix entre Overpair, Top Pair, Second Pair, Third Pair, Bottom Pair, etc.

---

## ✨ Característiques

### 🎯 Selector Visual de Rangs
- Graella interactiva **13×13** amb codificació per colors:
  - 🔴 **Vermell**: Parells (AA, KK, QQ...)
  - 🟢 **Verd**: Suited (AKs, KQs, QJs...)
  - 🔵 **Blau**: Offsuit (AKo, KQo, QJo...)
- Selecció per **clic** o **arrossegament** (drag-select).
- Presets ràpids: Top 5%, Top 10%, Top 20%, 100%.

### 🃏 Selector de Board Flexible
- Tabs intercanviables: **Flop (3)**, **Turn (4)**, **River (5)**.
- Entrada de cartes per:
  - Clic als slots gràfics.
  - Input de text (ex: `Ah Qd 5c`).
  - Picker visual amb totes les cartes.

### 📊 Anàlisi Estadística Completa
- Recompte de **combos vàlids** i **exclosos** (per cartes duplicades amb el board).
- Distribució per categories:
  - **Monster**: Royal Flush, Straight Flush, Quads, Full House
  - **Color**: Flush
  - **Escala**: Straight
  - **Trío**: Trips
  - **Doble Parella**: Two Pair
  - **Parella**: Overpair, Top Pair, Second Pair, Third Pair, Bottom Pair
  - **Carta Alta**: Ace High, Other
- Visualització amb **gràfic de barres progressives** i **taula detallada**.

### 📝 Notació de Rangs
- Suport per a notacions complexes: `AA+`, `AKs+`, `KQo`, etc.
- Botons de rangs predefinits per a accés ràpid.

---

## 📸 Captures de Pantalla

> _Pròximament: afegir captures de pantalla de l'aplicació en funcionament._

---

## 🛠 Stack Tecnològic

| Capa       | Tecnologia             | Versió    | Notes                          |
|------------|------------------------|-----------|--------------------------------|
| Frontend   | React                  | 18.2.0    | Componentització i gestió d'estat |
| Llenguatge | TypeScript             | 5.0+      | Tipat estàtic per seguretat    |
| Estils     | Tailwind CSS           | 4.1.7     | Utility-first CSS              |
| Build      | Vite                   | 6.4.3     | Bundler ràpid i modern         |
| Gràfics    | CSS + SVG              | -         | Visualitzacions lleugeres      |

**Nota**: A diferència de la versió original en Python/FastAPI, aquesta implementació funciona **100% al client**, sense necessitat de backend.

---

## 🚀 Instal·lació i Ús

### Prerequisits

- [Node.js](https://nodejs.org/) 18+ i npm

### Instal·lació

```bash
# Clona el repositori
git clone https://github.com/el-teu-usuari/poker-range-analyzer.git
cd poker-range-analyzer

# Instal·la les dependències
npm install
```

### Desenvolupament

```bash
# Inicia el servidor de desenvolupament
npm run dev
```

Obre [http://localhost:5173](http://localhost:5173) al navegador.

### Build de Producció

```bash
# Genera els fitxers optimitzats
npm run build

# Previsualitza el build
npm run preview
```

Els fitxers de producció es generen a `dist/` i es poden desplegar a qualsevol servidor estàtic (Vercel, Netlify, GitHub Pages, etc.).

### Validació de Tipus

```bash
npm run typecheck
```

---

## 📁 Estructura del Projecte

```
poker-range-analyzer/
├── index.html                    # Punt d'entrada HTML
├── package.json                  # Dependències i scripts
├── tsconfig.json                 # Configuració TypeScript
├── vite.config.js                # Configuració Vite
│
└── src/
    ├── main.tsx                  # Punt d'entrada React
    ├── App.tsx                   # Component principal
    ├── index.css                 # Estils globals i Tailwind
    │
    ├── components/
    │   ├── RangeGrid.tsx         # Graella 13×13 interactiva
    │   ├── BoardSelector.tsx     # Selector de board (flop/turn/river)
    │   └── Results.tsx           # Visualització de resultats
    │
    └── lib/
        ├── types.ts              # Tipus TypeScript (Card, HandCategory, etc.)
        ├── deck.ts               # Funcions de baralla i cartes
        ├── evaluator.ts          # Motor d'avaluació de mans
        ├── analyzer.ts           # Anàlisi de rangs vs. board
        ├── rangeParser.ts        # Parser de cel·les de la graella
        └── rangeNotation.ts      # Parser de notació (AA+, AKs+, etc.)
```

---

## ⚙️ Com Funciona

### 1. Generació de Combos

Cada cel·la de la graella 13×13 representa un tipus de mà:

| Tipus     | Exemple | Combos totals |
|-----------|---------|---------------|
| Parell    | AA      | 6             |
| Suited    | AKs     | 4             |
| Offsuit   | AKo     | 12            |

El sistema genera totes les combinacions possibles de 2 cartes per a cada cel·la seleccionada.

### 2. Filtratge per Board

Les cartes que apareixen al board s'exclouen automàticament dels combos possibles. Per exemple:

- **Board**: `Ah Kh 5c`
- **Rang**: `AA` (6 combos) → **5 combos vàlids** (l'`Ah` està al board)

### 3. Avaluació de Mans

Per a cada combo vàlid, el sistema:

1. Combina les 2 cartes del rival amb les cartes del board.
2. Genera totes les combinacions possibles de 5 cartes.
3. Avalua cada combinació i selecciona la **millor mà**.
4. Classifica la mà en el context del board (Top Pair, Overpair, etc.).

### 4. Classificació Contextual

La lògica de classificació distingeix:

- **Overpair**: Parella de butxaca superior a totes les cartes del board.
- **Top Pair**: Parella amb la carta més alta del board.
- **Second Pair**: Parella amb la segona carta del board.
- **Third Pair**: Parella amb la tercera carta del board.
- **Bottom Pair**: Parella inferior a totes les cartes del board.

---

## 🎯 Casos d'Ús i Exemples

### Exemple 1: Anàlisi Pre-Flop

**Rang rival**: `AA+, AKs+`  
**Board**: (buit)  
**Resultat**: 100% Overpair o As Alt

### Exemple 2: Flop Monocromàtic

**Rang rival**: `AKs` (4 combos suited)  
**Board**: `2h 7h Jh`  
**Resultat esperat**:
- **Flush**: 25% (només `AhKh` fa color)
- **As Alt**: 75% (els altres 3 combos)

### Exemple 3: Jerarquia de Parelles

**Rang rival**: `AA, KQo, 22`  
**Board**: `Ks 8d 3c`  
**Resultat esperat**:
- **AA**: Overpair (parella superior al board)
- **KQo**: Top Pair (parella de Reis)
- **22**: Bottom Pair (parella inferior al board)

### Exemple 4: Escala Progressiva

**Rang rival**: `JTs` (4 combos suited)  
**Board**:
- **Flop**: `9c 8d 7h` → 100% Escala
- **Turn**: `+ 6s` → 100% Escala
- **River**: `+ 5d` → 100% Escala

---

## ✅ Casos Límit Validats

### 1. Validació de Cartes Duplicades

**Escenari**: Board amb `Ah Kh 5c`, rang amb `AA` i `AKs`.  
**Resultat**: El sistema exclou automàticament els combos que contenen `Ah` o `Kh`.  
**Missatge**: "X combos exclosos per cartes duplicades amb el board".

### 2. Classificació en Board Monocromàtic

**Escenari**: Board `2h 7h Jh`, rang `AKs`.  
**Resultat**: Distingeix correctament entre Flush (25%) i As Alt (75%).

### 3. Jerarquia de Parelles

**Escenari**: Board `Ks 8d 3c`, rang `AA, KQo, 22`.  
**Resultat**: Classifica correctament Overpair, Top Pair i Bottom Pair.

### 4. Parsing de Notacions Complexes

**Entrada**: `AA+, AKs+`  
**Expansió correcta**:
- `AA+` → `{AA, KK, QQ, JJ, TT}` (30 combos)
- `AKs+` → `{AKs, AQs, AJs, ATs, ...}` (suited connectors)

### 5. Consistència en la Progressió de Carrers

**Escenari**: Rang `JTs`, board que evoluciona de flop a river.  
**Resultat**: Manté la classificació d'Escala en tots els carrers.

---

## 🔮 Futures Millores

- [ ] Exportar resultats a CSV/PDF
- [ ] Afegir suport per a rangs ponderats (weights)
- [ ] Mode "Equity" per calcular equitat vs. rangs específics
- [ ] Historial d'anàlisis recents
- [ ] Integració amb APIs de tracking (Hold'em Manager, PokerTracker)
- [ ] Mode fosc/clar commutable
- [ ] Suport per a variants (PLO, Short Deck)
- [ ] Animacions i transicions millorades

---

## 🤝 Contribucions

Les contribucions són benvingudes! Si trobes un error o tens una idea per millorar l'eina:

1. Fes un fork del repositori
2. Crea una branca per a la teva funcionalitat (`git checkout -b feature/nova-funcionalitat`)
3. Fes commit dels teus canvis (`git commit -m 'Afegeix nova funcionalitat'`)
4. Push a la branca (`git push origin feature/nova-funcionalitat`)
5. Obre un Pull Request

---

## 📄 Llicència

Aquest projecte està sota la llicència **MIT**. Consulta el fitxer [LICENSE](LICENSE) per a més detalls.

---

## 🙏 Agraïments

- Inspirat en [Flopzilla](https://flopzilla.com/) per l'anàlisi de rangs
- Creat amb [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/) i [Tailwind CSS](https://tailwindcss.com/)
- Icones i disseny: [Lucide React](https://lucide.dev/)

---

## 📧 Contacte

Si tens preguntes o suggeriments, no dubtis a obrir un [issue](https://github.com/el-teu-usuari/poker-range-analyzer/issues) al repositori.

---

**Feliç anàlisi de rangs!** 🎴♠️♥️♦️♣️

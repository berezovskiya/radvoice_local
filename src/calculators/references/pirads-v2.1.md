# PI-RADS v2.1 — Scoring Algorithm Reference

## Citation
Turkbey B, Rosenkrantz AB, Haider MA, et al. Prostate Imaging Reporting and Data System Version 2.1: 2019 Update of Prostate Imaging Reporting and Data System Version 2. European Urology. 2019;76(3):340-351. DOI: 10.1016/j.eururo.2019.02.033. PMID: 30898406.

## Peripheral Zone (PZ) — DWI is dominant

### DWI/ADC Scoring
| Score | Description |
|-------|-------------|
| 1 | No abnormality on ADC and high b-value DWI |
| 2 | Indistinct hypointense on ADC |
| 3 | Focal mildly-to-moderately hypointense on ADC, < 1.5 cm |
| 4 | Focal markedly hypointense on ADC, < 1.5 cm |
| 5 | Focal markedly hypointense on ADC, >= 1.5 cm OR extraprostatic extension |

### PZ Algorithm
- DWI 1 → PI-RADS 1
- DWI 2 → PI-RADS 2
- DWI 3 + DCE negative → PI-RADS 3
- DWI 3 + DCE positive → PI-RADS 4
- DWI 4 → PI-RADS 4
- DWI 5 → PI-RADS 5

DCE is binary (positive/negative). Only matters when DWI = 3.

## Transition Zone (TZ) — T2W is dominant

### T2W Scoring
| Score | Description |
|-------|-------------|
| 1 | Normal or round completely encapsulated BPH nodule |
| 2 | Circumscribed hypointense or heterogeneous encapsulated nodule |
| 3 | Heterogeneous with obscured margins |
| 4 | Lenticular or non-circumscribed, moderately hypointense, < 1.5 cm |
| 5 | Same as 4 but >= 1.5 cm OR extraprostatic extension |

### TZ Algorithm
- T2W 1 → PI-RADS 1
- T2W 2 + DWI <= 3 → PI-RADS 2
- T2W 2 + DWI >= 4 → PI-RADS 3
- T2W 3 + DWI <= 4 → PI-RADS 3
- T2W 3 + DWI == 5 → PI-RADS 4
- T2W 4 → PI-RADS 4
- T2W 5 → PI-RADS 5

DCE has NO role in TZ.

## Categories
| Category | Likelihood | Description |
|----------|-----------|-------------|
| PI-RADS 1 | Very Low | Clinically significant cancer highly unlikely |
| PI-RADS 2 | Low | Clinically significant cancer unlikely |
| PI-RADS 3 | Intermediate | Equivocal |
| PI-RADS 4 | High | Clinically significant cancer likely |
| PI-RADS 5 | Very High | Clinically significant cancer highly likely |

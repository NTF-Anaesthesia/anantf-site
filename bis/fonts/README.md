# Fonts for the BIS simulator screens (Medtronic BIS, BIS Advance, Masimo SedLine)

Self-hosted (no request to Google when the page loads). None of the real monitors' own typefaces is bundled: every font here is an open-licence look-alike. Latin subset, variable weight, from Google Fonts:

- `Arimo-latin-var.woff2`: Arimo (Apache License 2.0), Arial/Helvetica-metric look-alike. Used for the BIS number, labels and
  axis text of the BIS VISTA screen, which on the real monitor looks like Arial/Helvetica (the manufacturer does not publish
  the on-screen typeface, so this is a close look-alike, not the same font).
- `ArchivoNarrow-latin-var.woff2`: Archivo Narrow (SIL Open Font License 1.1), for the narrow key captions (SILENT, MENU, SENSOR CHECK).

- `ArchivoBlack-latin.woff2`: Archivo Black (SIL Open Font License 1.1), for the heavy "BIS" and "ST"/"EMG" headings of the Medtronic screen (the real ones look like Arial Black).
- `DejaVuSans-latin.woff2`, `DejaVuSans-Bold-latin.woff2`: DejaVu Sans (Bitstream Vera licence: free to use, copy and embed; Latin subset), for the axis labels, date and time and captions, which look like a wide Verdana-style sans on the real screen.

Licences: <https://github.com/google/fonts/tree/main/apache/arimo>, <https://github.com/google/fonts/tree/main/ofl/archivonarrow>, <https://github.com/google/fonts/tree/main/ofl/archivoblack> and <https://dejavu-fonts.github.io/License.html>.

## BIS Advance screen

- `Selawik-Light-latin.woff2`, `Selawik-Regular-latin.woff2`, `Selawik-Semibold-latin.woff2`: Selawik (SIL Open Font License 1.1, Microsoft, <https://github.com/microsoft/Selawik>), Latin
  subset (U+0020-007E, U+00A0-00FF and a few punctuation marks), made with fontTools. Selawik is metric-compatible with Segoe UI, which is the
  look of the BIS Advance tablet's on-screen text (digits, captions, dialogs). Licence: <https://github.com/microsoft/Selawik/blob/master/LICENSE.txt>.

## Masimo SedLine screen

- `Hind-400.woff2`, `Hind-500.woff2`, `Hind-600.woff2`: Hind (SIL Open Font License 1.1, Indian Type Foundry), Latin subset, from Google Fonts
  (<https://fonts.google.com/specimen/Hind>, licence <https://github.com/google/fonts/blob/main/ofl/hind/OFL.txt>). Masimo does not publish the
  on-screen typeface of Root; it looks like Frutiger (a "1" with a flag and no foot, narrow proportional digits). Hind is a Frutiger-style open font and
  matches the real digits much better than Source Sans 3, used before (owner, 15 Oct 2026: "the font doesn't really match"). No italic: the
  "SedLine" title's italic is drawn as an oblique.

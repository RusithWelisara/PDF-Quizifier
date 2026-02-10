import * as pdfjsLib from 'pdfjs-dist'

export async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    console.log(`PDF has ${pdf.numPages} pages`);
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()

        console.log(`Page ${i}: ${textContent.items.length} text items`);

        // Better text extraction that preserves line breaks
        let lastY = null;
        let pageText = '';

        textContent.items.forEach((item) => {
            // Check if we've moved to a new line (Y position changed significantly)
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                pageText += '\n';
            }

            // Add the text with a space
            pageText += item.str + ' ';
            lastY = item.transform[5];
        });

        fullText += pageText + '\n\n';
        console.log(`Page ${i} text preview:`, pageText.substring(0, 500));
    }

    console.log("Total extracted text length:", fullText.length);
    return fullText
}

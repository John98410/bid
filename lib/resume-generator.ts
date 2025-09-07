import { OpenAI } from 'openai';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium-min';

export const runtime = 'nodejs';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

let style = {
    textFont: 'Georgia, serif',
    headingFont: 'Georgia, serif',
    fontSize: '12px',
    lineHeight: '1.5',
    h1Color: '#0D58D0',
    h2Color: '#34A853',
    h3Color: '#000000',
    h4Color: '#4e4e4eff',
    textColor: '#000000',
    bgColor: '#FFFFFF',   
}

export async function generateResumePDFBuffer(jobTitle: string, jobDescription: string, account: any) {
    try {
        const prompt = makePrompt(jobTitle, jobDescription, account);
        const response = await openai.chat.completions.create({
            model: "gpt-5-nano",
            messages: [
                {
                    
                    role: "user",
                    content: prompt
                }
            ],
            // max_tokens: 2000,
            // temperature: 0.7,
        });

        const htmlContent = response.choices[0]?.message?.content || '';
        const accountStyle = account.styleSettings ? {
            textFont: account.styleSettings.textFont || style.textFont,
            textColor: account.styleSettings.textColor || style.textColor,
            bgColor: account.styleSettings.bgColor || style.bgColor,
            fontSize: style.fontSize,
            lineHeight: account.styleSettings.lineHeight || style.lineHeight,
            h1Color: account.styleSettings.fullNameColor || style.h1Color,
            h2Color: account.styleSettings.currentRoleColor || style.h2Color,
            h3Color: style.h3Color,
            h4Color: style.h4Color,
            headingFont: account.styleSettings.headingFont || style.headingFont,
        } : style;
        
        // Use account's style settings if available, otherwise use default
       

        const pdfBuffer = await makePDFBuffer(htmlContent, accountStyle);
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating resume PDF:', error);
        throw error;
    }
}

function makePrompt(jobTitle: string, jobDescription: string, account: any) {
    return `
    Forget anything you learned before. You are a professional resume writer.
    Act as a senior-level resume strategist and ATS optimization expert.
    Create a competitive, ATS-optimized resume for a Senior Software Engineer role.
    Use realistic but fictional work history You render the resume in html format(only body element), use appropriate html syntax for headings, lists, and emphasis.\n
    I want to make a resume to apply for the job titled "${jobTitle}".\n
    My Job title must be "${account.currentRole}".\n
    The Job description is as follows: ${jobDescription}\n
    ${account.fullName ? `name is ` + account.fullName : ""}, \n
    ${account.email ? `email is ` + account.email : ""}, \n
    ${account.phoneNumber ? `phone is ` + account.phoneNumber : ""}, \n
    ${account.address ? `address is ` + account.address : ""}.\n
    ${account.education ? `education is ` + account.education : ""}.\n
    ${account.companyHistory ? `work experience is ` + account.companyHistory : ""},\n
    ${account.extraNote ? `here is some more info about resume : ` + account.extraNote : ""},\n
    Here is a note about resume : ${account.extraNote}
    ${account.skills ? `my skills includes also ` + account.skills : ""},\n
   `;
}

async function makePDFBuffer(htmlContent: string, style: any) {
    try {
        const html = `
               <html>
                    <head>
                        <style>
                            body {
                                font-family: ${style.textFont}; 
                                color: ${style.textColor};
                                padding: 25px; 
                                background-color: ${style.bgColor};
                                font-size: ${style.fontSize}; 
                                line-height: ${style.lineHeight}; 
                                margin: 0; 
                            }

                              h1 {
                                  text-align: center; 
                                  color: ${style.h1Color}; 
                                  margin-bottom: 20px;
                                  page-break-after: avoid;
                                  font-family: ${style.headingFont};
                              }

                            h2 { 
                                color: ${style.h2Color}; 
                                page-break-after: avoid; 
                                text-align :center;
                                font-family: ${style.headingFont};
                            }
                            h3 { 
                                color: ${style.h3Color}; 
                                page-break-after: avoid; 
                                text-align :center;
                                font-family: ${style.headingFont};
                            }
                            h4 { 
                                color: ${style.h4Color}; 
                                page-break-after: avoid; 
                                text-align :center;
                                font-family: ${style.headingFont};
                            }

                            pre { 
                                background: #f4f4f4; 
                                padding: 10px; 
                                white-space: pre-wrap; 
                                word-wrap: break-word; 
                            }

                            /* Proper page break rules */
                            .page-break { 
                                page-break-before: always; 
                                break-before: page; 
                            }

                            /* Ensure padding is respected after page breaks */
                            @page { 
                                margin: 25px; 
                            }

                            </style>
                        </head>
                        <body>${htmlContent}</body>
                    </html>
        `;

        const browser = await puppeteer.launch({
            headless: true,
            executablePath: process.cwd() + '/.local-chrome/chrome-linux/chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: { top: '25mm', right: '25mm', bottom: '25mm', left: '25mm' },
            printBackground: true,
            displayHeaderFooter: false
        });
        
        await browser.close();
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

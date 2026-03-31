#!/usr/bin/env python3
"""
Claude AI機能まとめPDF生成スクリプト
Using reportlab for PDF generation
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def create_claude_pdf():
    output_path = '/home/user/-slack-claude-bot/Claude_AI_Capabilities.pdf'

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=28,
        spaceAfter=10,
        alignment=TA_CENTER
    )

    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=14,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=HexColor('#666666')
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading1'],
        fontSize=16,
        spaceBefore=20,
        spaceAfter=10,
        textColor=HexColor('#2c3e50'),
        backColor=HexColor('#ecf0f1'),
        borderPadding=5
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=8,
        leading=16
    )

    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontSize=11,
        leftIndent=20,
        spaceAfter=4
    )

    # Build content
    story = []

    # Title
    story.append(Paragraph('Claude AI', title_style))
    story.append(Paragraph('Capabilities Overview', subtitle_style))
    story.append(Paragraph('by Anthropic', subtitle_style))
    story.append(Spacer(1, 20))

    # 1. Introduction
    story.append(Paragraph('1. Introduction', heading_style))
    story.append(Paragraph(
        'Claude is an AI assistant developed by Anthropic. '
        'It is designed to be helpful, harmless, and honest. '
        'Claude can assist with a wide range of tasks across '
        'various domains including writing, analysis, coding, and more.',
        body_style
    ))
    story.append(Spacer(1, 10))

    # 2. Text Generation & Writing
    story.append(Paragraph('2. Text Generation & Writing', heading_style))
    writing_items = [
        'Creative writing (stories, poems, scripts)',
        'Professional documents (reports, emails, proposals)',
        'Content editing and proofreading',
        'Translation between languages',
        'Summarization of long texts',
        'Tone adjustment and rewriting',
    ]
    for item in writing_items:
        story.append(Paragraph(f'&#8226; {item}', bullet_style))
    story.append(Spacer(1, 10))

    # 3. Analysis & Research
    story.append(Paragraph('3. Analysis & Research', heading_style))
    analysis_items = [
        'Document analysis and information extraction',
        'Data interpretation and insights',
        'Research assistance and fact-checking',
        'Comparative analysis',
        'Trend identification',
        'Critical evaluation of arguments',
    ]
    for item in analysis_items:
        story.append(Paragraph(f'&#8226; {item}', bullet_style))
    story.append(Spacer(1, 10))

    # 4. Programming & Technical
    story.append(Paragraph('4. Programming & Technical', heading_style))
    coding_items = [
        'Code writing in multiple languages (Python, JavaScript, etc.)',
        'Code review and debugging',
        'Algorithm explanation and optimization',
        'API integration assistance',
        'Database query writing (SQL)',
        'Technical documentation',
    ]
    for item in coding_items:
        story.append(Paragraph(f'&#8226; {item}', bullet_style))

    story.append(PageBreak())

    # 5. Business & Productivity
    story.append(Paragraph('5. Business & Productivity', heading_style))
    business_items = [
        'Meeting notes and action items extraction',
        'Project planning and task breakdown',
        'Presentation outline creation',
        'Strategic analysis (SWOT, etc.)',
        'Customer communication drafts',
        'Process documentation',
    ]
    for item in business_items:
        story.append(Paragraph(f'&#8226; {item}', bullet_style))
    story.append(Spacer(1, 10))

    # 6. Education & Learning
    story.append(Paragraph('6. Education & Learning', heading_style))
    education_items = [
        'Concept explanation at various levels',
        'Study guide creation',
        'Practice problem generation',
        'Tutoring and Q&A',
        'Curriculum planning assistance',
        'Academic writing support',
    ]
    for item in education_items:
        story.append(Paragraph(f'&#8226; {item}', bullet_style))
    story.append(Spacer(1, 10))

    # 7. Creative & Design
    story.append(Paragraph('7. Creative & Design', heading_style))
    creative_items = [
        'Brainstorming and ideation',
        'Marketing copy and taglines',
        'Brand voice development',
        'Social media content',
        'Product descriptions',
        'Naming suggestions',
    ]
    for item in creative_items:
        story.append(Paragraph(f'&#8226; {item}', bullet_style))
    story.append(Spacer(1, 10))

    # 8. Important Limitations
    story.append(Paragraph('8. Important Limitations', heading_style))
    story.append(Paragraph(
        'While Claude is highly capable, it has important limitations:',
        body_style
    ))
    limitations = [
        'Cannot browse the internet or access real-time information',
        'Cannot execute code or access external systems directly',
        'Cannot create or edit images',
        'Knowledge cutoff means recent events may not be known',
        'May occasionally make mistakes or hallucinate information',
        'Should not be used for medical, legal, or financial advice',
    ]
    for item in limitations:
        story.append(Paragraph(f'&#8226; {item}', bullet_style))

    story.append(PageBreak())

    # 9. Best Practices
    story.append(Paragraph('9. Best Practices for Using Claude', heading_style))
    practices = [
        '1. Be specific and clear in your requests',
        '2. Provide relevant context and background',
        '3. Break complex tasks into smaller steps',
        '4. Verify important information independently',
        '5. Use follow-up questions to refine outputs',
        '6. Iterate on responses to improve quality',
    ]
    for item in practices:
        story.append(Paragraph(item, bullet_style))
    story.append(Spacer(1, 10))

    # 10. Conclusion
    story.append(Paragraph('10. Conclusion', heading_style))
    story.append(Paragraph(
        'Claude is a versatile AI assistant that can help with a wide '
        'variety of tasks. By understanding its capabilities and limitations, '
        'you can leverage Claude effectively to enhance productivity and '
        'accomplish your goals. For the best results, provide clear instructions '
        'and engage in an iterative dialogue to refine outputs.',
        body_style
    ))
    story.append(Spacer(1, 30))

    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_CENTER,
        textColor=HexColor('#888888')
    )
    story.append(Paragraph('Generated: 2026-03-31', footer_style))
    story.append(Paragraph('Anthropic - https://www.anthropic.com', footer_style))

    # Build PDF
    doc.build(story)
    return output_path

if __name__ == '__main__':
    path = create_claude_pdf()
    print(f'PDF created successfully: {path}')

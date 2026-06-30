from io import BytesIO

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

COMPANY_NAME = 'ERP RH'
COMPANY_TAGLINE = 'Service des Ressources Humaines'
COMPANY_ADDRESS = '123, Avenue Hassan II, Casablanca'
COMPANY_PHONE = '+212 5 22 00 00 00'
COMPANY_EMAIL = 'rh@erp-rh.ma'
NAVY = RGBColor(0x0F, 0x17, 0x2A)
BLUE = RGBColor(0x1E, 0x40, 0xAF)
GREY = RGBColor(0x60, 0x60, 0x60)
LIGHT_GREY = 'F2F2F2'

FR_WEEKDAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']


def _format_date_fr(d):
    return f"{d.strftime('%d/%m/%Y')} ({FR_WEEKDAYS[d.weekday()]})"


def _shade_cell(cell, color_hex):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    tc_pr.append(shd)


def _cell_border(cell, **kwargs):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = OxmlElement('w:tcBorders')
    for edge, spec in kwargs.items():
        el = OxmlElement(f'w:{edge}')
        el.set(qn('w:val'), spec.get('val', 'single'))
        el.set(qn('w:sz'), str(spec.get('sz', 6)))
        el.set(qn('w:color'), spec.get('color', '000000'))
        borders.append(el)
    tc_pr.append(borders)


def _seniority(date_embauche, today):
    if not date_embauche:
        return None
    years = today.year - date_embauche.year
    months = today.month - date_embauche.month
    if today.day < date_embauche.day:
        months -= 1
    if months < 0:
        years -= 1
        months += 12
    parts = []
    if years:
        parts.append(f"{years} an{'s' if years > 1 else ''}")
    parts.append(f"{months} mois")
    return ' et '.join(parts) if years else f"{months} mois"


def _section_heading(doc, number, title):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    run = p.add_run(f'{number}.  {title.upper()}')
    run.bold = True
    run.font.size = Pt(11.5)
    run.font.color.rgb = NAVY
    p.paragraph_format.keep_with_next = True
    border_p = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '6')
    bottom.set(qn('w:color'), '1E40AF')
    border_p.append(bottom)
    p._p.get_or_add_pPr().append(border_p)
    return p


def _info_table(doc, rows):
    table = doc.add_table(rows=0, cols=2)
    table.style = 'Table Grid'
    table.autofit = True
    table.columns[0].width = Cm(6)
    for label, value in rows:
        row = table.add_row().cells
        row[0].text = label
        row[0].paragraphs[0].runs[0].bold = True
        row[0].paragraphs[0].runs[0].font.size = Pt(10)
        _shade_cell(row[0], LIGHT_GREY)
        row[1].text = value if value else '—'
        row[1].paragraphs[0].runs[0].font.size = Pt(10)
    return table


def _checkbox_line(doc, choices, selected_code):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    for i, (code, label) in enumerate(choices):
        if i > 0:
            p.add_run('      ')
        checked = code == selected_code
        run = p.add_run(f"{'☑' if checked else '☐'} {label}")
        if checked:
            run.bold = True
            run.font.color.rgb = BLUE
    return p


def _new_document():
    doc = Document()
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(11)
    for section in doc.sections:
        section.left_margin = Cm(2)
        section.right_margin = Cm(2)
        section.top_margin = Cm(1.5)
    return doc


def _add_letterhead(doc, ref_code, dossier_number, request_date):
    head_table = doc.add_table(rows=1, cols=2)
    head_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    left_cell, right_cell = head_table.rows[0].cells

    left_cell.text = ''
    p = left_cell.paragraphs[0]
    run = p.add_run(COMPANY_NAME)
    run.bold = True
    run.font.size = Pt(18)
    run.font.color.rgb = NAVY
    p2 = left_cell.add_paragraph(COMPANY_TAGLINE)
    p2.runs[0].font.size = Pt(9)
    p2.runs[0].font.color.rgb = GREY
    p3 = left_cell.add_paragraph(f'{COMPANY_ADDRESS} — Tél : {COMPANY_PHONE}')
    p3.runs[0].font.size = Pt(8)
    p3.runs[0].font.color.rgb = GREY

    right_cell.text = ''
    p = right_cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = p.add_run(f'N° de dossier : {dossier_number}')
    run.bold = True
    run.font.size = Pt(9)
    run.font.color.rgb = NAVY
    p2 = right_cell.add_paragraph(f'Réf. formulaire : {ref_code}')
    p2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p2.runs[0].font.size = Pt(9)
    p2.runs[0].font.color.rgb = GREY
    p3 = right_cell.add_paragraph(f"Édité le : {request_date.strftime('%d/%m/%Y')}")
    p3.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p3.runs[0].font.size = Pt(9)
    p3.runs[0].font.color.rgb = GREY

    for cell in (left_cell, right_cell):
        _cell_border(cell, top={'val': 'nil'}, left={'val': 'nil'}, right={'val': 'nil'},
                     bottom={'val': 'single', 'sz': 12, 'color': '1E40AF'})

    doc.add_paragraph()


def _add_objet_line(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(10)
    run = p.add_run('Objet : ')
    run.bold = True
    run.font.size = Pt(10.5)
    run.font.color.rgb = NAVY
    run2 = p.add_run(text)
    run2.font.size = Pt(10.5)
    run2.italic = True


def _add_page_footer(doc):
    footer = doc.sections[0].footer
    footer_p = footer.paragraphs[0]
    footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    border_p = OxmlElement('w:pBdr')
    top = OxmlElement('w:top')
    top.set(qn('w:val'), 'single')
    top.set(qn('w:sz'), '6')
    top.set(qn('w:color'), 'CCCCCC')
    border_p.append(top)
    footer_p._p.get_or_add_pPr().append(border_p)
    run = footer_p.add_run(f'{COMPANY_NAME}  •  {COMPANY_ADDRESS}  •  {COMPANY_PHONE}  •  {COMPANY_EMAIL}')
    run.font.size = Pt(8)
    run.font.color.rgb = GREY


def _add_title_banner(doc, title_text):
    title_table = doc.add_table(rows=1, cols=1)
    title_cell = title_table.rows[0].cells[0]
    _shade_cell(title_cell, '0F172A')
    title_cell.text = ''
    p = title_cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(title_text)
    run.bold = True
    run.font.size = Pt(16)
    run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)

    note = doc.add_paragraph()
    note.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = note.add_run('Document à imprimer en double exemplaire, signer et remettre en main propre au service RH')
    run.italic = True
    run.font.size = Pt(9)
    run.font.color.rgb = GREY


def _add_employee_section(doc, employee, request_date, section_number=1):
    _section_heading(doc, section_number, "Identification de l'employé")
    full_name = employee.user.get_full_name() or employee.user.username
    department = employee.department.name if employee.department else employee.service
    seniority = _seniority(employee.date_embauche, request_date)
    _info_table(doc, [
        ('Nom et prénom', full_name),
        ('Matricule', employee.matricule),
        ('Poste occupé', employee.poste),
        ('Service / Département', department),
        ("Date d'embauche", employee.date_embauche.strftime('%d/%m/%Y') if employee.date_embauche else None),
        ("Ancienneté", seniority),
    ])


def _add_validation_section(doc, section_number, extra_hr_lines=None):
    _section_heading(doc, section_number, 'Validation')
    sig_table = doc.add_table(rows=1, cols=2)
    sig_table.style = 'Table Grid'
    left, right = sig_table.rows[0].cells

    left.text = ''
    p = left.paragraphs[0]
    run = p.add_run("SIGNATURE DE L'EMPLOYÉ")
    run.bold = True
    run.font.size = Pt(9.5)
    run.font.color.rgb = NAVY
    left.add_paragraph()
    left.add_paragraph()
    left.add_paragraph()
    fp = left.add_paragraph('Fait à : ________________________')
    fp.runs[0].font.size = Pt(9.5)
    fp2 = left.add_paragraph('Le : ____ / ____ / ________')
    fp2.runs[0].font.size = Pt(9.5)

    right.text = ''
    p = right.paragraphs[0]
    run = p.add_run('AVIS DU SERVICE RH')
    run.bold = True
    run.font.size = Pt(9.5)
    run.font.color.rgb = NAVY
    rp1 = right.add_paragraph('☐ Demande approuvée        ☐ Demande refusée')
    rp1.runs[0].font.size = Pt(9.5)
    rp2 = right.add_paragraph('Motif (si refus) : ________________________')
    rp2.runs[0].font.size = Pt(9.5)
    for line in (extra_hr_lines or []):
        rpx = right.add_paragraph(line)
        rpx.runs[0].font.size = Pt(9.5)
    right.add_paragraph()
    rp3 = right.add_paragraph('Nom du responsable : ________________________')
    rp3.runs[0].font.size = Pt(9.5)
    rp4 = right.add_paragraph('Date : ____ / ____ / ________     Signature et cachet :')
    rp4.runs[0].font.size = Pt(9.5)

    for cell in (left, right):
        for paragraph in cell.paragraphs:
            paragraph.paragraph_format.space_after = Pt(2)


def _add_footer_note(doc, text):
    doc.add_paragraph()
    footer = doc.add_paragraph()
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer.add_run(text)
    run.italic = True
    run.font.size = Pt(8)
    run.font.color.rgb = GREY


def _finalize(doc):
    buffer = BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer


def build_leave_request_docx(employee, leave_type, leave_types_choices, start_date, end_date,
                              duration_days, business_days, comment, request_date):
    doc = _new_document()
    leave_type_label = dict(leave_types_choices).get(leave_type, leave_type)
    dossier_number = f"CG-{employee.matricule}-{request_date.strftime('%Y%m%d')}"
    _add_letterhead(doc, 'FORM-RH-CONGE-01', dossier_number, request_date)
    _add_title_banner(doc, 'DEMANDE DE CONGÉS')
    _add_objet_line(doc, f"Demande de {leave_type_label.lower()} du {start_date.strftime('%d/%m/%Y')} "
                          f"au {end_date.strftime('%d/%m/%Y')} ({duration_days} jour(s))")
    _add_employee_section(doc, employee, request_date, section_number=1)

    _section_heading(doc, 2, 'Détails de la demande')
    _checkbox_line(doc, leave_types_choices, leave_type)

    duration_label = f'{duration_days} jour(s) calendaire(s)'
    if business_days:
        duration_label += f' — dont {business_days} jour(s) ouvrable(s)'

    _info_table(doc, [
        ('Date de début', _format_date_fr(start_date)),
        ('Date de fin', _format_date_fr(end_date)),
        ('Durée', duration_label),
        ('Motif / Commentaire', comment),
    ])

    _add_validation_section(doc, section_number=3)
    _add_footer_note(doc, "Ce document, une fois signé, doit être conservé dans le dossier du personnel de l'employé.")
    _add_page_footer(doc)
    return _finalize(doc)


def build_attestation_request_docx(employee, attestation_type, attestation_types_choices, purpose, comment, request_date):
    doc = _new_document()
    attestation_label = dict(attestation_types_choices).get(attestation_type, attestation_type)
    dossier_number = f"AT-{employee.matricule}-{request_date.strftime('%Y%m%d')}"
    _add_letterhead(doc, 'FORM-RH-ATTEST-01', dossier_number, request_date)
    _add_title_banner(doc, "DEMANDE D'ATTESTATION")
    _add_objet_line(doc, attestation_label)
    _add_employee_section(doc, employee, request_date, section_number=1)

    _section_heading(doc, 2, 'Détails de la demande')
    _checkbox_line(doc, attestation_types_choices, attestation_type)

    _info_table(doc, [
        ('Objectif / Destination', purpose),
        ('Commentaire', comment),
    ])

    _add_validation_section(doc, section_number=3, extra_hr_lines=['Attestation remise le : ____ / ____ / ________'])
    _add_footer_note(doc, "Ce document, une fois signé, doit être conservé dans le dossier du personnel de l'employé.")
    _add_page_footer(doc)
    return _finalize(doc)


def build_mission_request_docx(employee, destination, start_date, end_date, duration_days, reason, comment, request_date):
    doc = _new_document()
    dossier_number = f"OM-{employee.matricule}-{request_date.strftime('%Y%m%d')}"
    _add_letterhead(doc, 'FORM-RH-MISSION-01', dossier_number, request_date)
    _add_title_banner(doc, "DEMANDE D'ORDRE DE MISSION")
    _add_objet_line(doc, f"Ordre de mission à {destination} du {start_date.strftime('%d/%m/%Y')} "
                          f"au {end_date.strftime('%d/%m/%Y')} ({duration_days} jour(s))")
    _add_employee_section(doc, employee, request_date, section_number=1)

    _section_heading(doc, 2, 'Détails de la mission')
    _info_table(doc, [
        ('Destination', destination),
        ('Date de départ', _format_date_fr(start_date)),
        ('Date de retour', _format_date_fr(end_date)),
        ('Durée', f'{duration_days} jour(s)'),
        ('Objet de la mission', reason),
        ('Commentaire', comment),
    ])

    _add_validation_section(doc, section_number=3, extra_hr_lines=[
        'Moyen de transport accordé : ________________________',
        'Avance sur frais accordée : ________________________',
    ])
    _add_footer_note(doc, "Ce document, une fois signé, doit être conservé dans le dossier du personnel de l'employé.")
    _add_page_footer(doc)
    return _finalize(doc)


def build_payslip_request_docx(employee, periode_label, comment, request_date):
    doc = _new_document()
    dossier_number = f"BP-{employee.matricule}-{request_date.strftime('%Y%m%d')}"
    _add_letterhead(doc, 'FORM-RH-BULLETIN-01', dossier_number, request_date)
    _add_title_banner(doc, 'DEMANDE DE BULLETIN DE PAIE')
    _add_objet_line(doc, f'Duplicata de bulletin de paie — {periode_label}')
    _add_employee_section(doc, employee, request_date, section_number=1)

    _section_heading(doc, 2, 'Détails de la demande')
    _info_table(doc, [
        ('Période demandée', periode_label),
        ('Commentaire', comment),
    ])

    _add_validation_section(doc, section_number=3, extra_hr_lines=['Bulletin remis le : ____ / ____ / ________'])
    _add_footer_note(doc, "Ce document, une fois signé, doit être conservé dans le dossier du personnel de l'employé.")
    _add_page_footer(doc)
    return _finalize(doc)

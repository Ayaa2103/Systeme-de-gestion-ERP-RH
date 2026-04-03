# Human Resources Management System

A Django-based HRM system with role-based access control for managing employees, requests, and HR operations.

## Features

### User Roles
- **Employee**: Login, view profile & contract, request leave/certificate/mission/payslip, track request status
- **HR Manager**: Manage employees, handle requests, manage contracts & training
- **HR Director**: Approve/reject requests, define HR policies, view KPIs
- **Administrator**: Manage users, access rights, system configuration

## Setup Instructions

1. **Install Dependencies**
```bash
pip install django
```

2. **Database Setup**
```bash
python manage.py makemigrations
python manage.py migrate
```

3. **Create Superuser**
```bash
python manage.py createsuperuser
```

4. **Setup Groups**
```bash
python manage.py setup_groups
```

5. **Run Server**
```bash
python manage.py runserver
```

## Project Structure

```
newRH/
├── core/                   # User management, authentication, policies
├── employees/              # Employee profiles, contracts, training
├── requests_app/           # Leave, certificate, mission, payslip requests
├── recruitment/            # Job offers, applications, interviews
├── onboarding/             # Employee onboarding process
├── knowledge_management/   # Skills matrix, documents, competencies
├── company_culture/        # Company culture, suggestions, pages
├── templates/              # HTML templates
├── static/                 # Static files (CSS, JS, images)
├── media/                  # Uploaded files
└── manage.py
```

## Models

### Core App
- **User**: Custom user model with roles
- **HRPolicy**: HR policies management
- **Event**: Company events

### Employees App
- **Employee**: Employee profiles
- **Contract**: Employment contracts
- **Training**: Training programs
- **Department**: Organizational departments

### Requests App
- **LeaveRequest**: Leave requests
- **AttestationRequest**: Certificate requests
- **MissionOrderRequest**: Mission requests
- **PayslipRequest**: Payslip requests

### Recruitment App
- **JobOffer**: Job postings
- **Application**: Job applications
- **Interview**: Interview scheduling and feedback

### Onboarding App
- **OnboardingPlan**: Onboarding process templates
- **OnboardingTask**: Individual onboarding tasks
- **OnboardingFollowup**: Progress tracking

### Knowledge Management App
- **Skill**: Skills catalog
- **EmployeeSkill**: Employee skill assessments
- **Position**: Job positions
- **KnowledgeDocument**: Document repository

### Company Culture App
- **CulturePage**: Company culture content
- **Suggestion**: Employee suggestions system

## URLs

- `/login/` - User login
- `/dashboard/` - Role-based dashboard
- `/employees/` - Employee management (HR only)
- `/requests/` - Request management
- `/recruitment/` - Recruitment management
- `/onboarding/` - Onboarding process
- `/knowledge/` - Knowledge management
- `/culture/` - Company culture
- `/admin/` - Django admin interface

## Usage

1. Login with your credentials
2. Navigate based on your role:
   - **Employees**: Submit requests, view profile
   - **HR Staff**: Manage employees and requests
   - **Directors**: Approve requests, manage policies
   - **Admins**: System management

## Database

Uses SQLite by default. To use MySQL, update `DATABASES` in `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'hrm_db',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```
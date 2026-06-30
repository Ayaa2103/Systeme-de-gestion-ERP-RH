from .models import Notification, User


def create_notification(recipient, title, message='', notification_type='system', actor=None, link=''):
    if not recipient or not getattr(recipient, 'is_active', False):
        return None

    return Notification.objects.create(
        recipient=recipient,
        actor=actor,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
    )


def create_notifications_for_roles(roles, title, message='', notification_type='system', actor=None, link='', exclude_user=None):
    users = User.objects.filter(role__in=roles, is_active=True)
    if exclude_user:
        users = users.exclude(id=exclude_user.id)

    notifications = [
        Notification(
            recipient=user,
            actor=actor,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link,
        )
        for user in users
    ]
    return Notification.objects.bulk_create(notifications)

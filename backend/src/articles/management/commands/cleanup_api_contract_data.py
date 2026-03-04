import os

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Q

from articles.models import Article, Comment, Tag
from users.models import User


class Command(BaseCommand):
    help = (
        "Delete API contract-test data by namespace marker."
        " Matches users, articles, comments, and tags containing the marker."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--namespace",
            type=str,
            help=(
                "Namespace marker used by API contract tests."
                " Falls back to API_CONTRACTS_NAMESPACE env var."
            ),
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show matched records without deleting anything.",
        )

    def handle(self, *args, **options):
        namespace = (options.get("namespace") or "").strip()
        if not namespace:
            namespace = os.environ.get("API_CONTRACTS_NAMESPACE", "").strip()

        if not namespace:
            raise CommandError(
                "Missing namespace. Use --namespace or set "
                "API_CONTRACTS_NAMESPACE."
            )

        if len(namespace) < 6:
            raise CommandError(
                "Namespace is too short; expected at least 6 characters."
            )

        users_q = User.objects.filter(
            Q(username__icontains=namespace)
            | Q(email__icontains=namespace)
            | Q(bio__icontains=namespace)
        )
        articles_q = Article.objects.filter(
            Q(title__icontains=namespace)
            | Q(slug__icontains=namespace)
            | Q(description__icontains=namespace)
            | Q(body__icontains=namespace)
            | Q(tag_list__name__icontains=namespace)
        ).distinct()
        comments_q = Comment.objects.filter(body__icontains=namespace)
        tags_q = Tag.objects.filter(
            Q(name__icontains=namespace) | Q(slug__icontains=namespace)
        )

        user_ids = list(users_q.values_list("id", flat=True))
        article_ids = list(articles_q.values_list("id", flat=True))
        comment_ids = list(comments_q.values_list("id", flat=True))
        tag_ids = list(tags_q.values_list("id", flat=True))

        self.stdout.write(f"Namespace: {namespace}")
        self.stdout.write(f"Matched users: {len(user_ids)}")
        self.stdout.write(f"Matched articles: {len(article_ids)}")
        self.stdout.write(f"Matched comments: {len(comment_ids)}")
        self.stdout.write(f"Matched tags: {len(tag_ids)}")

        if options["dry_run"]:
            self.stdout.write(
                self.style.WARNING("Dry-run mode: no records were deleted.")
            )
            return

        with transaction.atomic():
            if comment_ids:
                Comment.objects.filter(id__in=comment_ids).delete()
            if article_ids:
                Article.objects.filter(id__in=article_ids).delete()
            if user_ids:
                User.objects.filter(id__in=user_ids).delete()
            if tag_ids:
                Tag.objects.filter(id__in=tag_ids).delete()

        self.stdout.write(self.style.SUCCESS("API contract data cleanup complete."))


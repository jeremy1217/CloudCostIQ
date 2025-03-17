import click
from backend.database.db import get_db
from backend.scripts.setup_admin import setup_admin_user, verify_admin_access

@click.group()
def cli():
    """CloudCostIQ CLI commands"""
    pass

@cli.group()
def admin():
    """Admin user management commands"""
    pass

@admin.command()
@click.argument('email')
@click.option('--verify-only', is_flag=True, help='Only verify access without making changes')
def setup(email, verify_only):
    """Set up or verify admin user access"""
    db = next(get_db())
    try:
        if verify_only:
            if verify_admin_access(db, email):
                click.echo("✅ User has proper admin access")
            else:
                click.echo("❌ User does not have proper admin access")
        else:
            if setup_admin_user(db, email):
                if verify_admin_access(db, email):
                    click.echo("✅ Admin access successfully set up and verified")
                else:
                    click.echo("⚠️ Admin setup completed but verification failed")
            else:
                click.echo("❌ Failed to set up admin access")
    finally:
        db.close()

if __name__ == '__main__':
    cli() 
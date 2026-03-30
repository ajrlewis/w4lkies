#!/usr/bin/env python3
from __future__ import annotations

import argparse
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import text

from database import SessionLocal
from models import Booking, Customer, Dog, Expense, Invoice, Service, User, Vet
from services import password_service


def utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def reset_database(db: SessionLocal) -> None:
    db.execute(
        text(
            'TRUNCATE TABLE booking, dog, invoice, expense, service, vet, customer, "user" RESTART IDENTITY CASCADE'
        )
    )
    db.commit()


def sync_sequences(db: SessionLocal) -> None:
    db.execute(
        text(
            """SELECT setval(
                pg_get_serial_sequence('"user"', 'user_id'),
                COALESCE((SELECT MAX(user_id) FROM "user"), 1),
                true
            )"""
        )
    )
    db.execute(
        text(
            """SELECT setval(
                pg_get_serial_sequence('customer', 'customer_id'),
                COALESCE((SELECT MAX(customer_id) FROM customer), 1),
                true
            )"""
        )
    )
    db.execute(
        text(
            """SELECT setval(
                pg_get_serial_sequence('vet', 'vet_id'),
                COALESCE((SELECT MAX(vet_id) FROM vet), 1),
                true
            )"""
        )
    )
    db.execute(
        text(
            """SELECT setval(
                pg_get_serial_sequence('service', 'service_id'),
                COALESCE((SELECT MAX(service_id) FROM service), 1),
                true
            )"""
        )
    )
    db.execute(
        text(
            """SELECT setval(
                pg_get_serial_sequence('dog', 'dog_id'),
                COALESCE((SELECT MAX(dog_id) FROM dog), 1),
                true
            )"""
        )
    )
    db.execute(
        text(
            """SELECT setval(
                pg_get_serial_sequence('booking', 'booking_id'),
                COALESCE((SELECT MAX(booking_id) FROM booking), 1),
                true
            )"""
        )
    )
    db.execute(
        text(
            """SELECT setval(
                pg_get_serial_sequence('invoice', 'invoice_id'),
                COALESCE((SELECT MAX(invoice_id) FROM invoice), 1),
                true
            )"""
        )
    )
    db.execute(
        text(
            """SELECT setval(
                pg_get_serial_sequence('expense', 'expense_id'),
                COALESCE((SELECT MAX(expense_id) FROM expense), 1),
                true
            )"""
        )
    )


def seed_database(db: SessionLocal) -> None:
    if db.query(User).count() > 0:
        print("Seed skipped: database already has users. Run with --reset to reseed.")
        return

    # First user can self-reference for created_by/updated_by.
    admin = User(
        user_id=1,
        name="admin",
        email="admin@w4lkies.local",
        password_hash=password_service.hash_password("admin123"),
        is_admin=True,
        is_active=True,
        created_by=1,
        updated_by=1,
    )
    db.add(admin)
    db.flush()

    staff_1 = User(
        user_id=2,
        name="alice",
        email="alice@w4lkies.local",
        password_hash=password_service.hash_password("alice123"),
        is_admin=False,
        is_active=True,
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    staff_2 = User(
        user_id=3,
        name="bob",
        email="bob@w4lkies.local",
        password_hash=password_service.hash_password("bob123"),
        is_admin=False,
        is_active=True,
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    db.add_all([staff_1, staff_2])
    db.flush()

    customer_1 = Customer(
        customer_id=1,
        name="John Carter",
        phone="+44 7700 900111",
        email="john.carter@example.com",
        emergency_contact_name="Lena Carter",
        emergency_contact_phone="+44 7700 900112",
        signed_up_on=utc_now_naive(),
        is_active=True,
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    customer_2 = Customer(
        customer_id=2,
        name="Maya Singh",
        phone="+44 7700 900221",
        email="maya.singh@example.com",
        emergency_contact_name="Amit Singh",
        emergency_contact_phone="+44 7700 900222",
        signed_up_on=utc_now_naive() - timedelta(days=7),
        is_active=True,
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    db.add_all([customer_1, customer_2])
    db.flush()

    vet_1 = Vet(
        vet_id=1,
        name="Dr. Emma Reeves",
        address="24 High Street, Manchester",
        phone="+44 161 555 1001",
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    vet_2 = Vet(
        vet_id=2,
        name="Dr. Oliver James",
        address="78 Bridge Road, Liverpool",
        phone="+44 151 555 1002",
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    db.add_all([vet_1, vet_2])
    db.flush()

    service_1 = Service(
        service_id=1,
        name="Solo Walk",
        price=22.0,
        description="45-minute solo dog walk",
        duration=45,
        is_publicly_offered=True,
        is_active=True,
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    service_2 = Service(
        service_id=2,
        name="Group Walk",
        price=16.5,
        description="45-minute social group walk",
        duration=45,
        is_publicly_offered=True,
        is_active=True,
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    service_3 = Service(
        service_id=3,
        name="Puppy Visit",
        price=18.0,
        description="30-minute puppy home check-in",
        duration=30,
        is_publicly_offered=True,
        is_active=True,
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    db.add_all([service_1, service_2, service_3])
    db.flush()

    dog_1 = Dog(
        dog_id=1,
        name="Rex",
        date_of_birth=date(2021, 5, 12),
        is_allowed_treats=True,
        is_allowed_off_the_lead=True,
        is_allowed_on_social_media=True,
        is_neutered_or_spayed=True,
        behavioral_issues="Reactive to bicycles",
        medical_needs="None",
        breed="Labrador Retriever",
        customer_id=customer_1.customer_id,
        vet_id=vet_1.vet_id,
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    dog_2 = Dog(
        dog_id=2,
        name="Luna",
        date_of_birth=date(2022, 8, 3),
        is_allowed_treats=True,
        is_allowed_off_the_lead=False,
        is_allowed_on_social_media=True,
        is_neutered_or_spayed=False,
        behavioral_issues="Nervous around loud traffic",
        medical_needs="Joint supplement with lunch",
        breed="Border Collie",
        customer_id=customer_2.customer_id,
        vet_id=vet_2.vet_id,
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    db.add_all([dog_1, dog_2])
    db.flush()

    booking_1 = Booking(
        booking_id=1,
        date=date.today() + timedelta(days=1),
        time=time(9, 30),
        customer_id=customer_1.customer_id,
        service_id=service_1.service_id,
        invoice_id=None,
        user_id=staff_1.user_id,
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    booking_2 = Booking(
        booking_id=2,
        date=date.today() + timedelta(days=2),
        time=time(11, 0),
        customer_id=customer_2.customer_id,
        service_id=service_2.service_id,
        invoice_id=None,
        user_id=staff_2.user_id,
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    db.add_all([booking_1, booking_2])
    db.flush()

    # Create invoice and explicitly link booking(s) back to invoice_id so
    # download/PDF flows can always resolve invoice -> bookings.
    invoice_1 = Invoice(
        invoice_id=1,
        date_start=date.today() - timedelta(days=7),
        date_end=date.today(),
        date_issued=date.today(),
        date_due=date.today() + timedelta(days=14),
        date_paid=None,
        price_subtotal=service_1.price,
        price_discount=0.0,
        price_total=service_1.price,
        customer_id=customer_1.customer_id,
        reference="INV-0001",
        bookings=[booking_1],
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    db.add(invoice_1)
    db.flush()
    booking_1.invoice_id = invoice_1.invoice_id
    db.flush()

    expense_1 = Expense(
        expense_id=1,
        date=date.today() - timedelta(days=2),
        price=24.99,
        description="Training treats bulk pack",
        category="Supplies",
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    expense_2 = Expense(
        expense_id=2,
        date=date.today() - timedelta(days=1),
        price=89.50,
        description="Van fuel and parking",
        category="Transport",
        created_by=admin.user_id,
        updated_by=admin.user_id,
    )
    db.add_all([expense_1, expense_2])

    sync_sequences(db)
    db.commit()

    print("Seed complete:")
    print("- users: 3 (admin/alice/bob)")
    print("- customers: 2")
    print("- vets: 2")
    print("- services: 3")
    print("- dogs: 2")
    print("- invoices: 1")
    print("- bookings: 2")
    print("- expenses: 2")
    print("Login examples:")
    print("- admin / admin123")
    print("- alice / alice123")
    print("- bob / bob123")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed local W4lkies database")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Truncate existing tables before seeding",
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        if args.reset:
            reset_database(db)
        seed_database(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()

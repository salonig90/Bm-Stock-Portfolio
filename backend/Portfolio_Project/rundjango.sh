#!/bin/bash
cd /home/salonig/Bm-Stock-Portfolio/backend/Portfolio_Project
source venv/bin/activate
python3 manage.py runserver 0.0.0.0:8000

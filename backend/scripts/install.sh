#! /usr/bin/env bash

rm -rf venv
python3.9 -m venv venv;
source venv/bin/activate;
source .env;

pip3 install --upgrade pip;
pip3 install -r requirements.txt;

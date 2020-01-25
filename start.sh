#!/usr/bin/env bash
git pull
sudo docker image build -t airpay_country_admin:1.0 .
sudo docker rm -f apc_container
sudo docker run -p 80:80 -d --name apc_container airpay_country_admin:1.0

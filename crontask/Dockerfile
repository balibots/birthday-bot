FROM alpine/curl:8.5.0

COPY crontab.txt /etc/crontabs/root

CMD ["/usr/sbin/crond", "-f"]

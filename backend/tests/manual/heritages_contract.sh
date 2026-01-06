#!/bin/bash
set -e

echo "GET /api/v1/heritages"

curl -s http://localhost:8000/api/v1/heritages \
| jq 'length == 26'

curl -s http://localhost:8000/api/v1/heritages \
| jq '.[0] | has("id") and has("badge_image_url")'

curl -s http://localhost:8000/api/v1/heritages \
| jq -r '.[0].badge_image_url' \
| grep "^/static/badges/"

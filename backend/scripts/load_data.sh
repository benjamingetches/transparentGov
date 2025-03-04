#!/bin/bash

echo "Loading sample data into MongoDB..."
mongosh localhost:27017/govtrack --file load_sample_data.js

echo "Done!" 
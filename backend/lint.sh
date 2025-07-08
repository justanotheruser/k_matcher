black --line-length=100 .
isort --profile black .
mypy k_matcher
flake8 k_matcher
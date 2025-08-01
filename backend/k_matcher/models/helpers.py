import sqlalchemy as sa


class IntEnum(sa.types.TypeDecorator):
    impl = sa.Integer

    def __init__(self, enumtype, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._enumtype = enumtype

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return value.value

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return self._enumtype(value)

    def __repr__(self) -> str:
        return 'sa.Integer()'

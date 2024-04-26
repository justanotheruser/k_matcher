from plhdr_project_name.config import load_config


def main():
    cfg = load_config("cfg/cfg.yaml")
    print(f"Hello World! Config: {cfg}")


if __name__ == "__main__":
    main()

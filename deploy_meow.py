import os
import ftplib

HOST = "ftp.us.stackcp.com"
USER = "kitty@artkitty.net"
PASS = '1bZ1XL3O`t$:'
REMOTE_DIR = "/public_html/meow/lcmd"
LOCAL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")

def make_dirs_recursive(ftp, remote_dir):
    parts = [p for p in remote_dir.split('/') if p]
    path = ''
    for part in parts:
        path += '/' + part
        try:
            ftp.cwd(path)
        except ftplib.error_perm:
            try:
                ftp.mkd(path)
            except ftplib.error_perm:
                pass

def upload_directory(ftp, local_dir, remote_dir):
    make_dirs_recursive(ftp, remote_dir)
    ftp.cwd(remote_dir)

    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        if os.path.isfile(local_path):
            with open(local_path, "rb") as f:
                print(f"Uploading {item} to {remote_dir}...")
                ftp.storbinary(f"STOR {item}", f)
        elif os.path.isdir(local_path):
            sub_remote = f"{remote_dir}/{item}"
            upload_directory(ftp, local_path, sub_remote)
            ftp.cwd(remote_dir)

def main():
    if not os.path.exists(LOCAL_DIR):
        print(f"Error: {LOCAL_DIR} does not exist. Run npm run build first.")
        return

    print(f"Connecting to {HOST} as {USER}...")
    ftp = ftplib.FTP(HOST)
    ftp.login(USER, PASS)
    print(f"Uploading {LOCAL_DIR} to {REMOTE_DIR}...")
    upload_directory(ftp, LOCAL_DIR, REMOTE_DIR)
    ftp.quit()
    print("SUCCESS: Deployment to meow.artkitty.net/lcmd complete!")

if __name__ == "__main__":
    main()

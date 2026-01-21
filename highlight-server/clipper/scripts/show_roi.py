import argparse
import cv2


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", required=True)
    parser.add_argument("--roi-x", type=int, default=592)
    parser.add_argument("--roi-y", type=int, default=535)
    parser.add_argument("--roi-w", type=int, default=98)
    parser.add_argument("--roi-h", type=int, default=19)
    parser.add_argument("--fps", type=float, default=30.0)
    args = parser.parse_args()

    cap = cv2.VideoCapture(args.path)
    if not cap.isOpened():
        raise SystemExit("failed to open video")

    delay = int(1000 / max(args.fps, 1.0))

    while True:
        ok, frame = cap.read()
        if not ok or frame is None:
            break

        x1 = max(0, args.roi_x)
        y1 = max(0, args.roi_y)
        x2 = min(frame.shape[1], x1 + args.roi_w)
        y2 = min(frame.shape[0], y1 + args.roi_h)
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        cv2.imshow("ROI Preview", frame)
        key = cv2.waitKey(delay)
        if key == 27:
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()

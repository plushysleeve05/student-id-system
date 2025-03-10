# Importing all necessary libraries 
import cv2 
import os 
from datetime import datetime

def setup_output_directory():
    """Create output directory for storing frames"""
    try: 
        if not os.path.exists('data'): 
            os.makedirs('data')
        return True
    except OSError: 
        print('Error: Creating directory of data')
        return False

def process_video_stream(source=0, frame_interval=30):
    """
    Process video stream and extract frames
    Args:
        source: Camera index or IP camera URL (default=0 for primary webcam)
        frame_interval: Interval between saved frames (default=30)
    """
    # Initialize video capture from webcam
    cam = cv2.VideoCapture(source)
    
    if not cam.isOpened():
        print("Error: Could not open video stream")
        return
    
    # Ensure output directory exists
    if not setup_output_directory():
        return

    currentframe = 0
    try:
        while True:
            # Reading from frame 
            ret, frame = cam.read() 

            if not ret:
                print("Error: Could not read frame")
                break

            # Save every nth frame
            if currentframe % frame_interval == 0:
                # Generate timestamp for unique filename
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                name = f'./data/frame_{timestamp}_{currentframe}.jpg'
                print('Creating...' + name)
                cv2.imwrite(name, frame)

                # Display the frame (optional - for monitoring)
                cv2.imshow('Live Stream', frame)

            # increasing counter
            currentframe += 1

            # Break loop with 'q' key
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("Stream stopped by user")
                break

    except KeyboardInterrupt:
        print("Stream stopped by user (Keyboard Interrupt)")
    
    finally:
        # Release resources
        cam.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    # You can modify these parameters as needed
    CAMERA_SOURCE = 0  # Use 0 for primary webcam, 1 for secondary, or IP camera URL
    FRAME_INTERVAL = 30  # Save every 30th frame
    
    process_video_stream(CAMERA_SOURCE, FRAME_INTERVAL)

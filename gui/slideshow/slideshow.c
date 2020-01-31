// System Headers
#include <stdio.h>
#include <string.h>
#include <fcntl.h>
#include <sys/wait.h>
#include <time.h>
#include <unistd.h>
#include <signal.h>
#include <wiringPi.h> // Gordons Wiring Pi

#include "slideshow.h"

#include "shared.h"
#include "queue/queue.h"
#include "buttons/buttons.h"
#include "gui/pages.h"

/* --no-commandline enabled BIND everything you need in init script
void pg_slideshowSendVim(char* cmd) {
  // printf("Send Vim: %s\n", cmd);
  pg_slideshowVimLock = 1;
  fflush(pg_slideshowFD);
  fputs(":", pg_slideshowFD);
  usleep(1000);
  fputs(cmd, pg_slideshowFD);
  fflush(pg_slideshowFD);
  pg_slideshowVimLock = 0;

  if (pg_slideshowDelayNext) {
    pg_slideshowDelayNext = millis() + (pg_slideshowDelay * 1000);
  }
}
*/


void pg_slideshowReset(gslc_tsGui *pGui) {
  // debug_print("%s\n", "Slideshow Reset");
  if (pg_slideshowVimLock == 0) {
    pg_slideshowVimLock = 1;
    pg_slideshow_destroy(pGui);
    pg_slideshow_open(pGui);
    pg_slideshowVimLock = 0;
  }
}

void pg_slideshowSendChar(char* cmd) {
  // debug_print("Send Char: %s\n", cmd);
  int lockCnt = 0;
  while (pg_slideshowVimLock == 1 && lockCnt < 25) {
    // debug_print("%s\n", "Locked VIM");
    usleep(100);
    lockCnt++;
  }
  fputs(cmd, pg_slideshowFD);
}

void pg_slideshowPrevImage() {
  if (pg_slideshowZooming) { return; }
  pg_slideshowSendChar("p");

  if (pg_slideshowDelayNext) {
    pg_slideshowDelayNext = millis() + (pg_slideshowDelay * 1000);
  }
}

void pg_slideshowNextImage() {
  if (pg_slideshowZooming) { return; }

  pg_slideshowSendChar("n");
  if (pg_slideshowDelayNext) {
    pg_slideshowDelayNext = millis() + (pg_slideshowDelay * 1000);
  }
}






bool pg_slideshowCbBtn(void* pvGui,void *pvElemRef,gslc_teTouch eTouch,int16_t nX,int16_t nY)
{
  if (eTouch == GSLC_TOUCH_DOWN_IN) {
    pg_slideshowGentureXa = nX;
    pg_slideshowGentureYa = nY;

  } else if (eTouch == GSLC_TOUCH_MOVE_IN) {
    // printf("T: %d, X: %d, Y: %d\n", eTouch, nX, nY);

  } else if (eTouch == GSLC_TOUCH_UP_IN) {
    pg_slideshowGentureXb = nX;
    pg_slideshowGentureYb = nY;

    // Gesture Calcuator
    int zX = pg_slideshowGentureXa - pg_slideshowGentureXb;
    int zY = pg_slideshowGentureYa - pg_slideshowGentureYb;

    if (abs(zX) == abs(zY)) {
      // Diagonal
      if (abs(zX) > 10) {
        // debug_print("Diagonal %d\n", abs(zX));
      } else {
        // debug_print("Clicked %d\n", abs(zX));
        pg_slideshowZooming = 1;
        pg_slideshowSendChar("+");
      }
    } else if (abs(zX) > abs(zY)) {
      // Majority Horizontal
      if (zX > 15) {
        // debug_print("Leftish %d\n", abs(zX));
        if (pg_slideshowZooming == 1) { pg_slideshowSendChar("l"); }
      } else if (zX < -15) {
        // debug_print("Rightish %d\n", abs(zX));
        if (pg_slideshowZooming == 1) { pg_slideshowSendChar("h"); }
      } else {
        // debug_print("Clicked %d\n", abs(zX));
        pg_slideshowZooming = 1;
        pg_slideshowSendChar("+");
      }
    } else if (abs(zX) < abs(zY)) {
      // Majority Vertical
      if (zY > 10) {
        // debug_print("Upish %d\n", abs(zY));
        if (pg_slideshowZooming == 1) { pg_slideshowSendChar("j"); }
      } else if (zY < -10) {
        // debug_print("Downish %d\n", abs(zY));
        if (pg_slideshowZooming == 1) { pg_slideshowSendChar("k"); }
      } else {
        // debug_print("Clicked %d\n", abs(zY));
        pg_slideshowZooming = 1;
        pg_slideshowSendChar("+");
      }
    }
  }
  return true;
}

void pg_slideshowGuiInit(gslc_tsGui *pGui) {
  pg_slideshowPgPointed = 1;

  gslc_PageAdd(pGui, E_PG_SLIDESHOW, pg_slideshowElem, MAX_ELEM_PG_DEFAULT,
    pg_slideshowElemRef, MAX_ELEM_PG_DEFAULT);
  // gslc_SetBkgndColor(pGui, GSLC_COL_GRAY_DK2);

  gslc_ElemCreateBtnImg(pGui, E_ELEM_SLIDESHOW_FULLSCREEN, E_PG_SLIDESHOW,
    (gslc_tsRect){0,0,480,320},
    gslc_GetImageFromFile(IMG_GREEN_FULLSCREEN, GSLC_IMGREF_FMT_BMP16),
    gslc_GetImageFromFile(IMG_GREEN_FULLSCREEN, GSLC_IMGREF_FMT_BMP16),
    &pg_slideshowCbBtn);
}

void pg_slideshowGuiRedraw(gslc_tsGui *pGui) {
  gslc_ElemDraw(pGui, E_PG_SLIDESHOW, E_ELEM_SLIDESHOW_FULLSCREEN);
}



void pg_slideshowButtonRotaryCW() {
  // Zoom Mode, Right Button Pressed, Rotary CW
  if (pg_slideshowZooming && lib_buttonsLastInterruptAction[E_BUTTON_RIGHT_PRESSED]) {
    lib_buttonsLastInterruptAction[E_BUTTON_RIGHT_HELD] = 1; // Surpress cbHeld
    pg_slideshowSendChar("k");


  // Zoom Mode, Left Button Pressed, Rotary CW
  } else if (pg_slideshowZooming && lib_buttonsLastInterruptAction[E_BUTTON_LEFT_PRESSED]) {
    lib_buttonsLastInterruptAction[E_BUTTON_LEFT_HELD] = 1; // Surpress cbHeld
    pg_slideshowZooming = 1;
    pg_slideshowSendChar("+");


  // Right Button Pressed, Rotary CW
  } else if (lib_buttonsLastInterruptAction[E_BUTTON_RIGHT_PRESSED]) {
    lib_buttonsLastInterruptAction[E_BUTTON_RIGHT_HELD] = 1; // Surpress cbHeld
    // pg_slideshowReset();


  // Left Button Pressed, Rotary CW
  } else if (lib_buttonsLastInterruptAction[E_BUTTON_LEFT_PRESSED]) {
    pg_slideshowZooming = 1; // Start Zoom Mode
    lib_buttonsLastInterruptAction[E_BUTTON_LEFT_HELD] = 1; // Surpress cbHeld
    pg_slideshowSendChar("+");


  // Zoom Mode, Rotary CW
  } else if (pg_slideshowZooming) {
    pg_slideshowSendChar("l");


  // Rotary CW
  } else {
    pg_slideshowNextImage();
  }
}




void pg_slideshowButtonRotaryCCW() {
  // Zoom Mode, Right Button Pressed, Rotary CCW
  if (pg_slideshowZooming && lib_buttonsLastInterruptAction[E_BUTTON_RIGHT_PRESSED]) {
    lib_buttonsLastInterruptAction[E_BUTTON_RIGHT_HELD] = 1; // Surpress cbHeld
    pg_slideshowSendChar("j");


  // Zoom Mode, Left Button Pressed, Rotary CCW
  } else if (pg_slideshowZooming && lib_buttonsLastInterruptAction[E_BUTTON_LEFT_PRESSED]) {
    lib_buttonsLastInterruptAction[E_BUTTON_LEFT_HELD] = 1; // Surpress cbHeld
    pg_slideshowSendChar("-");


  // Right Button Pressed, Rotary CCW
  } else if (lib_buttonsLastInterruptAction[E_BUTTON_RIGHT_PRESSED]) {
    lib_buttonsLastInterruptAction[E_BUTTON_RIGHT_HELD] = 1; // Surpress cbHeld
    // pg_slideshowReset();


  // Left Button Pressed, Rotary CCW
  } else if (lib_buttonsLastInterruptAction[E_BUTTON_LEFT_PRESSED]) {
    pg_slideshowZooming = 1; // Start Zoom Mode
    lib_buttonsLastInterruptAction[E_BUTTON_LEFT_HELD] = 1; // Surpress cbHeld
    pg_slideshowSendChar("-");


  // Zoom Mode, Rotary CCW
  } else if (pg_slideshowZooming) {
    pg_slideshowSendChar("h");


  // Rotary CCW
  } else {
    pg_slideshowPrevImage();
  }
}


void pg_slideshowButtonLeftPressed() {
  // debug_print("%s\n", "Prev Button!");
  if (!pg_slideshowZooming) {
    pg_slideshowPrevImage();
  }
}

void pg_slideshowButtonRightPressed() {
  // debug_print("%s\n", "Next Button!");
  if (pg_slideshowZooming) {
    if (pg_slideshowDelayNext) {
      pg_slideshowDelayNext = millis() + (pg_slideshowDelay * 1000);
    }
    pg_slideshowZooming = 0;
    // pg_slideshowSendChar("a");
  }
  pg_slideshowNextImage();
}

void pg_slideshowButtonRotaryPressed() {
  // debug_print("%s\n", "Rotary Button!");
  if (pg_slideshowZooming) {
    // Reset slideshow delay
    if (pg_slideshowDelayNext) {
      pg_slideshowDelayNext = millis() + (pg_slideshowDelay * 1000);
    }
    // Zoom mode disable
    pg_slideshowZooming = 0;
    // reset image to auto zoom size
    pg_slideshowSendChar("a"); // Reset to default zoom size

  } else {

    if (pg_slideshowPaused == 0) {
      pg_slideshowPaused = 1;
    } else {
      pg_slideshowPaused = 0;
      if (pg_slideshowDelayNext) {
        pg_slideshowDelayNext = millis() + (pg_slideshowDelay * 1000);
      }
    }
  }
}

void pg_slideshowButtonLeftHeld() {
  // debug_print("%s\n", "Left Held Slideshow");
  pg_slideshowSendChar("^"); // Goto Beginning
}

void pg_slideshowButtonRightHeld() {
  printf("%s\n", "Right Held Slideshow");
}

void pg_slideshowButtonRotaryHeld() {
  // debug_print("%s\n", "Rotary Held Slideshow");
  touchscreenPageClose(&m_gui, E_PG_SLIDESHOW);
  touchscreenPageOpen(&m_gui, E_PG_MAIN);
}

void pg_slideshowButtonDoubleHeld() {
  // kill(0, SIGINT);
  touchscreenPageClose(&m_gui, E_PG_SLIDESHOW);
  touchscreenPageOpen(&m_gui, E_PG_MAIN);
}

void pg_slideshowButtonSetFuncs() {
  lib_buttonsSetCallbackFunc(E_BUTTON_ROTARY_CW, &pg_slideshowButtonRotaryCW);
  lib_buttonsSetCallbackFunc(E_BUTTON_ROTARY_CCW, &pg_slideshowButtonRotaryCCW);
  lib_buttonsSetCallbackFunc(E_BUTTON_LEFT_RELEASED, &pg_slideshowButtonLeftPressed);
  lib_buttonsSetCallbackFunc(E_BUTTON_RIGHT_RELEASED, &pg_slideshowButtonRightPressed);
  lib_buttonsSetCallbackFunc(E_BUTTON_ROTARY_RELEASED, &pg_slideshowButtonRotaryPressed);
  lib_buttonsSetCallbackFunc(E_BUTTON_LEFT_HELD, &pg_slideshowButtonLeftHeld);
  lib_buttonsSetCallbackFunc(E_BUTTON_RIGHT_HELD, &pg_slideshowButtonRightHeld);
  lib_buttonsSetCallbackFunc(E_BUTTON_ROTARY_HELD, &pg_slideshowButtonRotaryHeld);
  lib_buttonsSetCallbackFunc(E_BUTTON_DOUBLE_HELD, &pg_slideshowButtonDoubleHeld);
}

void pg_slideshowButtonUnsetFuncs() {
  lib_buttonsSetCallbackFunc(E_BUTTON_ROTARY_CW, NULL);
  lib_buttonsSetCallbackFunc(E_BUTTON_ROTARY_CCW, NULL);
  lib_buttonsSetCallbackFunc(E_BUTTON_LEFT_RELEASED, NULL);
  lib_buttonsSetCallbackFunc(E_BUTTON_RIGHT_RELEASED, NULL);
  lib_buttonsSetCallbackFunc(E_BUTTON_ROTARY_RELEASED, NULL);
  lib_buttonsSetCallbackFunc(E_BUTTON_LEFT_HELD, NULL);
  lib_buttonsSetCallbackFunc(E_BUTTON_RIGHT_HELD, NULL);
  lib_buttonsSetCallbackFunc(E_BUTTON_ROTARY_HELD, NULL);
}


/*
PI_THREAD (pg_slideshowFolderWatchThread) {
  if (pg_slideshowFolderWatchThreadRunning) { return NULL; }
  pg_slideshowFolderWatchThreadRunning = 1;
  char tmp_inotify_ret[1024];

  // debug_print("%s\n", "Opening Slideshow");
  // Open the command for reading.
  pg_slideshowFolderWatchFP = popen("/usr/bin/inotifywait -m -e create,delete,move --exclude '/\\.' /home/pi/shared", "r");
  if (pg_slideshowFolderWatchFP == NULL) {
    // puts("Failed to run command");
    return NULL;
  }

  int d = fileno(pg_slideshowFolderWatchFP);
  fcntl(d, F_SETFL, O_NONBLOCK);

  size_t chread;
  // Read the output a line at a time - output it.
  while ((chread = fread(tmp_inotify_ret, 1, sizeof(char), pg_slideshowFolderWatchFP)) != 0) {
  // while (fgets(tmp_inotify_ret, sizeof(char)-1, pg_slideshowFolderWatchFP) != NULL) {
    // debug_print("INotify--:%s:--\n", tmp_inotify_ret);
	  char delim[] = " ";
    char *ptr = strtok(tmp_inotify_ret, delim);

    // Filename is last space separated value
    char *filename = ptr;
    // debug_print(" %s\n", ptr);
    while ((ptr = strtok(NULL," ")) != NULL) {
      // debug_print(" %s\n", ptr);
      filename = ptr;
    }

    // Not Dotfiles.. macbooks are bad about these
    if (filename[0] != '.') {
      // debug_print("Update Set For %s\n", filename);
      // pg_slideshowUpdateFileList();
    }
//     if (strcmp(tmp_inotify_ret, "/home/pi/shared/ CREATE mpv.socket\n") == 0) {
//      printf("INotify Found.\n");
//    }
  }

  // close
  int exitCode = WEXITSTATUS(pclose(pg_slideshowFolderWatchFP));
  pg_slideshowFolderWatchThreadRunning = 0;
  if (exitCode) {
    return NULL;
  } else {
    return NULL;
  }
}

int pg_slideshowFolderWatchThreadStart() {
  // debug_print("%s\n", "Starting Slideshow Folder Watch");
  return piThreadCreate(pg_slideshowFolderWatchThread);
}

void pg_slideshowFolderWatchThreadStop() {
  if (pg_slideshowFolderWatchThreadRunning) {
    system("killall /usr/bin/inotifywait");
    // fflush(pg_slideshowFolderWatchFP);
    // pclose(pg_slideshowFolderWatchFP);
    pg_slideshowFolderWatchThreadRunning = 0;
    // debug_print("%s\n", "Slideshow Folder Watch Shutdown");
  }
}
*/





// GUI Init
void pg_slideshow_init(gslc_tsGui *pGui) {
  // m_clean_dotfiles = "find /home/pi/shared -type f -name \".*\" -exec rm \"{}\" \\;";

  pg_slideshowPaused = 0; // Pause Slideshow
  pg_slideshowDelay = 10; // Delay between photos in seconds
  pg_slideshowDelayNext = millis() + (pg_slideshowDelay * 1000); // milli of last delay

  pg_slideshowZooming = 0;
  pg_slideshowVimLock = 0;

  pg_slideshowGuiInit(pGui);

  cbInit[E_PG_SLIDESHOW] = NULL;
}




int pg_slideshow_thread(gslc_tsGui *pGui) {
  int i_now = millis();

  if (pg_slideshowPaused == 0 &&
      pg_slideshowZooming == 0 &&
      pg_slideshowDelayNext > 0 &&
      pg_slideshowDelayNext < i_now
  ) {
    pg_slideshowButtonRightPressed();
    return 1;
  }

  char tmp_inotify_ret[1024];
  while (fgets(tmp_inotify_ret, sizeof(tmp_inotify_ret)-1, pg_slideshowFD) != NULL) {
    printf("SLIDESHOW--:%s:--\n", tmp_inotify_ret);
	  
  }
  return 0;
}



// GUI Open
void pg_slideshow_open(gslc_tsGui *pGui) {
  // debug_print("%s\n", "Slideshow Setting Button Functions");
  pg_slideshowButtonSetFuncs();

  if(!(pg_slideshowFD = popen("/usr/bin/fim -d /dev/fb0 -a -q --sort-basename --no-commandline -R /home/pi/shared/slideshow/", "w"))){
    // debug_print("%s\n", "Cannot Open image folder");
  } else {
    int d = fileno(pg_slideshowFD);
    fcntl(d, F_SETFL, O_NONBLOCK);
    setbuf(pg_slideshowFD, NULL);
  }

  // // debug_print("%s\n", "Slideshow Starting Folder Watch");
  // pg_slideshowFolderWatchThreadStart();
  // debug_print("%s\n", "Slideshow Starting FBCP");
  fbcp_start();
  // // debug_print("%s\n", "Slideshow Updating Filelist");
  // pg_slideshowUpdateFileList();

  // debug_print("%s\n", "Slideshow Opening");
}


void pg_slideshow_close(gslc_tsGui *pGui) {
  fbcp_stop();

  system("killall fim");
  fflush(pg_slideshowFD);
  pclose(pg_slideshowFD);
}

// GUI Destroy
void pg_slideshow_destroy(gslc_tsGui *pGui) {
  // debug_print("%s\n", "Slideshow Stopping");
  // pg_slideshowButtonUnsetFuncs();
  
  // // debug_print("%s\n", "Slideshow Stopping Folder Watch");
  // pg_slideshowFolderWatchThreadStop();
  // // debug_print("%s\n", "Slideshow Stopping Slideshow Thread");
  // pg_slideshowThreadStop();
  // debug_print("%s\n", "Slideshow Destroyed");
}

void __attribute__ ((constructor)) pg_slideshow_constructor(void) {
  cbInit[E_PG_SLIDESHOW] = &pg_slideshow_init;
  cbOpen[E_PG_SLIDESHOW] = &pg_slideshow_open;
  cbClose[E_PG_SLIDESHOW] = &pg_slideshow_close;
  cbThread[E_PG_SLIDESHOW] = &pg_slideshow_thread;
  cbDestroy[E_PG_SLIDESHOW] = &pg_slideshow_destroy;
  pg_slideshowQueue = ALLOC_QUEUE_ROOT();
}

void __attribute__ ((destructor)) pg_slideshow_destructor(void) {

}


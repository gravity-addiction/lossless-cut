#ifndef _SLIDESHOW_H_
#define _SLIDESHOW_H_

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus


#include "gui/pages.h"


gslc_tsElem pg_slideshowElem[MAX_ELEM_PG_DEFAULT_RAM];
gslc_tsElemRef pg_slideshowElemRef[MAX_ELEM_PG_DEFAULT];

int pg_slideshowPgPointed;

FILE *pg_slideshowFolderWatchFP;
FILE *pg_slideshowFD;

struct queue_root *pg_slideshowQueue;

int pg_slideshowNMove;
int pg_slideshowPMove;
int pg_slideshowDelay;
int pg_slideshowDelayNext;
int pg_slideshowPaused;

int pg_slideshowThreadKill; // Stopping Thread
int pg_slideshowThreadRunning; // Running Thread
int pg_slideshowFolderWatchThreadRunning; // Running Folder Watch Thread

int pg_slideshowChildStatus;

int pg_slideshowZooming;
int pg_slideshowVimLock;
int pg_slideshowGentureXa;
int pg_slideshowGentureXb;
int pg_slideshowGentureYa;
int pg_slideshowGentureYb;

// void pg_slideshowSendVim(char* cmd);
void pg_slideshowSendChar(char* cmd);

void pg_slideshowPrevImage();
void pg_slideshowNextImage();

void pg_slideshowButtonRotaryCW();
void pg_slideshowButtonRotaryCCW();
void pg_slideshowButtonLeftPressed();
void pg_slideshowButtonRightPressed();
void pg_slideshowButtonRotaryPressed();
void pg_slideshowButtonLeftHeld();
void pg_slideshowButtonRightHeld();
void pg_slideshowButtonRotaryHeld();
void pg_slideshowButtonSetFuncs();
void pg_slideshowButtonUnsetFuncs();


void pg_slideshow_init(gslc_tsGui *pGui);
void pg_slideshow_open(gslc_tsGui *pGui);
int pg_slideshow_thread(gslc_tsGui *pGui);
void pg_slideshow_destroy(gslc_tsGui *pGui);

void __attribute__ ((constructor)) pg_slideshow_constructor(void);
void __attribute__ ((destructor)) pg_slideshow_destructor(void);

#endif // _SLIDESHOW_H_
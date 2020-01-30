#ifndef _PAGES_SDOB_SUBMIT_H_
#define _PAGES_SDOB_SUBMIT_H_

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus


#include "gui/pages.h"

enum {
  E_SDOB_SUBMIT_EL_BOX,
  E_SDOB_SUBMIT_EL_BTN_CANCEL,
  E_SDOB_SUBMIT_EL_BTN_CLEAR,
  E_SDOB_SUBMIT_EL_BTN_SUBMIT,
  E_SDOB_SUBMIT_EL_TXT_VIDEOFILE,
  E_SDOB_SUBMIT_EL_TXT_CHAPTER,
  E_SDOB_SUBMIT_EL_TXT_SCORE,
  E_SDOB_SUBMIT_EL_TXT_TEAMNUM,
  E_SDOB_SUBMIT_EL_TXT_ROUNDNUM,
  E_SDOB_SUBMIT_EL_TXT_TMP,

  E_SDOB_SUBMIT_EL_BTN_TMPKB,

  E_SDOB_SUBMIT_EL_MAX
};

gslc_tsElem m_asPgSdobSubmitElem[MAX_ELEM_PG_DEFAULT_RAM];
gslc_tsElemRef m_asPgSdobSubmitElemRef[MAX_ELEM_PG_DEFAULT];

gslc_tsElemRef* pg_sdobSubmitEl[E_SDOB_SUBMIT_EL_MAX];

struct pg_sdob_submit_info {
  char *chapterStr;
  char *teamStr;
  char *roundStr;
  char *scoreStr;
};
struct pg_sdob_submit_info *sdob_submit_info;

struct pg_sdob_submit_info * PG_SDOB_SUBMIT_INIT_INFO();
void PG_SDOB_SUBMIT_CLEAR_INFO(struct pg_sdob_submit_info *si);



void pg_sdobSubmitButtonRotaryCW();
void pg_sdobSubmitButtonRotaryCCW();
void pg_sdobSubmitButtonLeftPressed();
void pg_sdobSubmitButtonRightPressed();
void pg_sdobSubmitButtonRotaryPressed();
void pg_sdobSubmitButtonLeftHeld();
void pg_sdobSubmitButtonRightHeld();
void pg_sdobSubmitButtonRotaryHeld();
void pg_sdobSubmitButtonDoubleHeld();
void pg_sdobSubmitButtonSetFuncs();

void pg_sdobSubmit_init(gslc_tsGui *pGui);
void pg_sdobSubmit_open(gslc_tsGui *pGui);
void pg_sdobSubmit_destroy(gslc_tsGui *pGui);
void __attribute__ ((constructor)) pg_sdobSubmit_setup(void);


#ifdef __cplusplus
}
#endif // __cplusplus
#endif // _PAGES_SDOB_SUBMIT_H_
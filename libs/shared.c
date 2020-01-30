
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <errno.h>
#include <fcntl.h>
#include <unistd.h>
#include <inttypes.h>
#include <dirent.h>
#include <sys/stat.h>
#include <sys/ioctl.h>
#include <sys/kd.h>

#include "shared.h"
#include "jsmn/jsmn.h"

#define DIM(x) (sizeof(x)/sizeof((x)))

void free(void *ptr);

static const char *sizes[] = { "EiB", "PiB", "TiB", "GiB", "MiB", "KiB", "B" };
static const uint64_t exbibytes = 1024ULL * 1024ULL * 1024ULL *
                                  1024ULL * 1024ULL * 1024ULL;

#ifndef HAVE_STRLCAT
/*
 * '_cups_strlcat()' - Safely concatenate two strings.
 */

size_t                  /* O - Length of string */
strlcat(char *dst,        /* O - Destination string */
        const char *src,      /* I - Source string */
        size_t size)      /* I - Size of destination string buffer */
{
  size_t    srclen;         /* Length of source string */
  size_t    dstlen;         /* Length of destination string */


 /*
  * Figure out how much room is left...
  */

  dstlen = strlen(dst);
  size -= dstlen + 1;

  if (!size)
    return (dstlen);        /* No room, return immediately... */

 /*
  * Figure out how much room is needed...
  */

  srclen = strlen(src);

 /*
  * Copy the appropriate amount...
  */

  if (srclen > size)
    srclen = size;

  memcpy(dst + dstlen, src, srclen);
  dst[dstlen + srclen] = '\0';

  return (dstlen + srclen);
}
#endif /* !HAVE_STRLCAT */

#ifndef HAVE_STRLCPY
/*
 * '_cups_strlcpy()' - Safely copy two strings.
 */

size_t                  /* O - Length of string */
strlcpy(char *dst,        /* O - Destination string */
        const char *src,      /* I - Source string */
        size_t      size)     /* I - Size of destination string buffer */
{
  size_t    srclen;         /* Length of source string */


 /*
  * Figure out how much room is needed...
  */

  size --;

  srclen = strlen(src);

 /*
  * Copy the appropriate amount...
  */

  if (srclen > size)
    srclen = size;

  memcpy(dst, src, srclen);
  dst[srclen] = '\0';

  return (srclen);
}
#endif /* !HAVE_STRLCPY */


void init_string(struct string *s) {
  s->len = 0;
  s->ptr = malloc(s->len+1);
  if (s->ptr == NULL) {
    // debug_print("%s\n", "malloc() failed");
    return;
  }
  s->ptr[0] = '\0';
}
size_t writefunc(void *ptr, size_t size, size_t nmemb, struct string *s)
{
  size_t new_len = s->len + size * nmemb;
  s->ptr = realloc(s->ptr, new_len + 1);
  if (s->ptr == NULL) {
    // debug_print("%s\n", "realloc() failed");
    return (size_t)0;
  }
  memcpy(s->ptr+s->len, ptr, size*nmemb);
  s->ptr[new_len] = '\0';
  s->len = new_len;

  return size*nmemb;
}

int fd_is_valid(int fd) {
  return fcntl(fd, F_GETFD) != -1 || errno != EBADF;
}

int setnonblock(int sock) {
  int flags;
  flags = fcntl(sock, F_GETFL, 0);
  if (-1 == flags)
    return -1;
  return fcntl(sock, F_SETFL, flags | O_NONBLOCK);
}

void *malloc_aligned(unsigned int size)
{
  // printf("Malloc Size: %d\n", size);
  void *ptr;
	int r = posix_memalign(&ptr, 32, size + 64 + sizeof(size_t));
	if (r != 0) {
		perror("malloc error");
    // printf("malloc_aligned ABORTING!\n");
		abort();
	}
	memset(ptr, 0, size);
	return ptr;
}

int sgetline(int fd, char ** out)
{
  int buf_size = 0;
  int in_buf = 0;
  int ret;
  char ch;
  char * buffer = NULL;
  char * new_buffer;

  do {
    // read a single byte
    ret = read(fd, &ch, 1);
    if (ret < 1)
    {
      // error or disconnect
      if (buffer != NULL) { free(buffer); }
      return 0;
    }

    // has end of line been reached?
    if (ch == '\n') { break; } // yes

    // is more memory needed?
    if ((buf_size == 0) || (in_buf == buf_size))
    {
      buf_size += 128;
      new_buffer = realloc(buffer, buf_size);

      if (!new_buffer)
      {
        if (buffer != NULL) { free(buffer); }
        // debug_print("%s\n", "Couldn't Reset Buffer1");
        return -1;
      }

      buffer = new_buffer;
    }

    buffer[in_buf] = ch;
    ++in_buf;
  } while (1);

  // if the line was terminated by "\r\n", ignore the
  // "\r". the "\n" is not in the buffer
  if ((in_buf > 0) && (buffer[in_buf-1] == '\r'))
      --in_buf;

  // is more memory needed?
  if ((buf_size == 0) || (in_buf == buf_size))
  {
    ++buf_size;
    new_buffer = realloc(buffer, buf_size);

    if (!new_buffer)
    {
      if (buffer != NULL) { free(buffer); }
      // debug_print("%s\n", "Couldn't Reset Buffer2");
      return -1;
    }

    buffer = new_buffer;
  }

// // debug_print("Got Line: %s\n", buffer);
  // add a null terminator
  buffer[in_buf] = '\0';
  // printf("Readline: %s\n", buffer);
  strlcpy(*out, buffer, in_buf + 1);
  free(buffer);
  // *out = buffer; // complete line
  return in_buf; // number of chars in the line, not counting the line break and null terminator
}


void sgetlines_withcb(char *buf, size_t len, void (*function)(char *, size_t sz, size_t cnt)) {
  char newBuf[len + 1];
  CLEAR(newBuf, len + 1);

  int lineLen = 0;
  int lineCnt = 0;
  // split reply up by line
  for (size_t i = 0; i < len; i++) {
    if (buf[i] == '\n') { // found line end
      function(newBuf, lineLen, lineCnt);

      CLEAR(newBuf, lineLen); // clear cache buffer
      lineLen = 0;
      lineCnt++;

    // add next charactor to newBuf
    } else {
      newBuf[lineLen] = buf[i];
      lineLen++;
    }
  }
  if (lineLen > 0) { // Try process last entry that didn't have a line return;
    function(newBuf, lineLen, lineCnt);
  }
}



int cmp_strcmp(const void *lhs, const void *rhs)
{
  return strcmp(lhs, rhs);
}

int cmp_atoi(const void *a, const void *b)
{
  const char **ia = (const char **)a;
  const char **ib = (const char **)b;

  int _ia = atoi(*ia);
  int _ib = atoi(*ib);

  return (_ia > _ib) ? 1 : 0;
}

// Define debug message function for GUIslice

int time_to_secs(char* timestamp) {
  int h, m, s = 0;
  int secs = -1;
  if (sscanf(timestamp, "%d:%d:%d", &h, &m, &s) >= 2) {
    secs = h *3600 + m*60 + s;
  }
  return secs;
}

void secs_to_time(int millisecs, char *retFormat, int retLen) {
  int milliseconds = (long) (millisecs / 1000) % 1000;
  int seconds      = (((int) (millisecs / 1000) - milliseconds)/1000)%60;
  int minutes      = (((((int) (millisecs / 1000) - milliseconds)/1000) - seconds)/60) %60;
  int hours        = ((((((int) (millisecs / 1000) - milliseconds)/1000) - seconds)/60) - minutes)/60;

/*
  while(milliseconds >= 10) {
    milliseconds = milliseconds / 10;
  }
*/
  // Round by > .8
  if (milliseconds >= 800) {
    seconds++;
  }

  // snprintf(ret, retsize, "%02d:%02d:%02d.%d", hours, minutes, seconds, milliseconds);
  snprintf(retFormat, retLen, "%02d:%02d:%02d", hours, minutes, seconds);
}


int jsoneq(const char *json, jsmntok_t *tok, const char *s)
{
  if (tok->type == JSMN_STRING && (int)strlen(s) == tok->end - tok->start &&
      strncmp(json + tok->start, s, tok->end - tok->start) == 0) {
    return 0;
  }
  return -1;
}

void ta_json_parse(char *json, char* prop, char ** ret_var) {
  int i;
  int r;
  jsmn_parser p;
  jsmntok_t t[128]; /* We expect no more than 128 tokens */
  char * buffer = NULL;
  char * new_buffer;

  jsmn_init(&p);
  r = jsmn_parse(&p, json, strlen(json), t,
                 sizeof(t) / sizeof(t[0]));
  if (r < 0) {
    // printf("Failed to parse JSON: %d\n", r);
    return;
  }

  /* Assume the top-level element is an object */
  if (r < 1 || t[0].type != JSMN_OBJECT) {
    // printf("Object expected\n");
    return;
  }

  // // debug_print("JSON PARSE, %d - %s", r, json);
  /* Loop over all keys of the root object */
  for (i = 1; i < r; i++) {
    if (jsoneq(json, &t[i], prop) == 0) {
      int len = t[i + 1].end - t[i + 1].start;
      new_buffer = realloc(buffer, len + 2);
      if (!new_buffer) {
        if (buffer != NULL) { free(buffer); }
        i++;
        continue;
      }
      buffer = new_buffer;
      /* We may use strndup() to fetch string value */
      snprintf(buffer, len + 1, "%.*s",  t[i + 1].end - t[i + 1].start, json + t[i + 1].start);
      strlcpy(*ret_var, buffer, len + 2);
      free(buffer);
    }
    i++;
  }
return;
}

int parseTabbedData(const char *s, char *data[], size_t n) {
  size_t i = 0;
  const char *Start = s;

  while (1) {
    if ((*s == '\t') || (*s == '\0')) {
      if (i >= n) {
        // printf("%s\n", "Cannot Parse Tabbed Data, More Tabs than N");
        return -1;  // More than n data
      }
      size_t Length = s - Start;
      memcpy(data[i], Start, Length);
      data[i][Length] = '\0';
      i++;
      if (*s == '\0') {
        return i;
      }
      s++;
      Start = s;
    }
    else s++;
  }
  return 0;
}


// Create list of files from folder, loop twice first for count and second for data
size_t file_list(const char *path, char ***ls) {
  size_t count = 0;
  DIR *dp = NULL;
  struct dirent *ep = NULL;

  dp = opendir(path);
  if(NULL == dp) {
      fprintf(stderr, "no such directory: '%s'", path);
      return 0;
  }

  *ls = NULL;
  ep = readdir(dp);
  while(NULL != ep){
    struct stat s;
    size_t fullpathSz = snprintf(NULL, 0, "%s/%s", path, ep->d_name) + 1;
    char *fullpath = (char*)calloc(fullpathSz, sizeof(char));
    snprintf(fullpath, fullpathSz, "%s/%s", path, ep->d_name);
    if (stat(fullpath, &s) == 0 && (s.st_mode & S_IFREG)) {
      count++;
    }
    free(fullpath);
    ep = readdir(dp);
  }

  rewinddir(dp);
  *ls = calloc(count, sizeof(char));

  count = 0;
  ep = readdir(dp);
  while(NULL != ep){
    struct stat s;
    size_t fullpathSz = snprintf(NULL, 0, "%s/%s", path, ep->d_name) + 1;
    char *fullpath = (char*)calloc(fullpathSz, sizeof(char));
    snprintf(fullpath, fullpathSz, "%s/%s", path, ep->d_name);
    if (stat(fullpath, &s) == 0 && (s.st_mode & S_IFREG)) {
      (*ls)[count++] = strdup(ep->d_name);
    }
    free(fullpath);
    ep = readdir(dp);
  }

  closedir(dp);
  return count;
}


// Create list of files from folder, loop twice first for count and second for data
size_t folder_list(const char *path, char ***ls) {
  size_t count = 0;
  DIR *dp = NULL;
  struct dirent *ep = NULL;

  dp = opendir(path);
  if(NULL == dp) {
      fprintf(stderr, "no such directory: '%s'", path);
      return 0;
  }

  *ls = NULL;
  ep = readdir(dp);
  while(NULL != ep){
    /*if (strcmp(ep->d_name, ".") == 0 || strcmp(ep->d_name, "..")) {
      ep = readdir(dp);
      continue;
    }*/
    struct stat s;
    size_t fullpathSz = snprintf(NULL, 0, "%s/%s", path, ep->d_name) + 1;
    char *fullpath = (char*)calloc(fullpathSz, sizeof(char));
    snprintf(fullpath, fullpathSz, "%s/%s", path, ep->d_name);
    if (stat(fullpath, &s) == 0 && (s.st_mode & S_IFDIR)) {
      count++;
    }
    free(fullpath);
    ep = readdir(dp);
  }

  rewinddir(dp);
  *ls = calloc(count, sizeof(char));

  count = 0;
  ep = readdir(dp);
  while(NULL != ep){
    /*if (strcmp(ep->d_name, ".") == 0 || strcmp(ep->d_name, "..")) {
      ep = readdir(dp);
      continue;
    }*/
    struct stat s;
    size_t fullpathSz = snprintf(NULL, 0, "%s/%s", path, ep->d_name) + 1;
    char *fullpath = (char*)calloc(fullpathSz, sizeof(char));
    snprintf(fullpath, fullpathSz, "%s/%s", path, ep->d_name);
    if (stat(fullpath, &s) == 0 && (s.st_mode & S_IFDIR)) {
      (*ls)[count++] = strdup(ep->d_name);
    }
    free(fullpath);
    ep = readdir(dp);
  }

  closedir(dp);
  return count;
}

char * calculateSize(uint64_t size)
{
    char *result = (char *)malloc(sizeof(char) * 20);
    uint64_t  multiplier = exbibytes;
    int i;

    for (i = 0; i < DIM(sizes); i++, multiplier /= 1024)
    {
        if (size < multiplier)
            continue;
        if (size % multiplier == 0)
            sprintf(result, "%" PRIu64 " %s", size / multiplier, sizes[i]);
        else
            sprintf(result, "%.1f %s", (float) size / multiplier, sizes[i]);
        return result;
    }
    strcpy(result, "0");
    return result;
}

/*
//---------------------
// System Commands
//---------------------
void run_system_cmd(char *fullpath) {
  if (fullpath == NULL) { return; }

  system(fullpath);
}

int run_system_cmd_with_return(char *fullpath, char *ret, int retsize) {
  if (fullpath == NULL) {
    // puts("No Path");
    return -1;
  } else {
    // printf("Running: %s\n", fullpath);
    // Open the command for reading.

    FILE *fd;
    fd = popen(fullpath, "r");
    if (!fd) return 1;

    char buffer[256];
    size_t chread;

    size_t comalloc = 256;
    size_t comlen = 0;
    char  *comout = malloc(comalloc);
    if (comout == NULL) { return 1; }

    // Use fread so binary data is dealt with correctly
    while ((chread = fread(buffer, 1, sizeof(buffer), fd)) != 0) {
      if (comlen + chread >= comalloc) {
        comalloc *= 2;
        comout = realloc(comout, comalloc);
      }
      memmove(comout + comlen, buffer, chread);
      comlen += chread;
    }

    // copy output to return
    strlcpy(ret, comout, retsize - 1);
    if (comout != NULL) { free(comout); }

    int pidC = pclose(fd);
    return WEXITSTATUS(pidC);
  }
}

void fbcp_start() {
  if (!fbcp_running) {
    fbcp_stop();
    fbcp_running = 1;
    system("fbcp &");
  }
}
void fbcp_stop() {
  system("killall fbcp &");
  fbcp_running = 0;
}
*/

